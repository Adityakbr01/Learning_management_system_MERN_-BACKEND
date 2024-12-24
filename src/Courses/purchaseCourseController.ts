import Stripe from "stripe";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/config";
import { Course } from "./coursesModel";
import { CoursePurchase } from "./purchaseCourseModel";
import { Lecture } from "../Lecture/lectureModel";
import User from "../user/userModel";

const stripe = new Stripe(config.Publishable_key_STRIP as string, {
  apiVersion: "2024-12-18.acacia",
});

export const createCheckOutSesion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId: string = req.id as string; // Ensure `req.id` is a string
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        message: "Course not found!",
      });
      return;
    }

    // Validate coursePrice to ensure it's not undefined
    if (!course.coursePrice) {
      res.status(400).json({
        message: "Course price is not set.",
      });
      return;
    }

    // Validate course details
    if (!course.coursePrice || !course.courseTitle || !course.courseThumbnail) {
      res.status(400).json({ message: "Invalid course details!" });
      return;
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Correct property name
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail], // Ensure this is a valid URL
            },
            unit_amount: course.coursePrice * 100, // Stripe expects amount in smallest currency unit
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${config.FRONTEND_URL}/course-progress/${courseId}`,
      cancel_url: `${config.FRONTEND_URL}/course-details/${courseId}`,
      metadata: {
        courseId,
        userId,
      },
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
    });

    // Check if the session URL is valid
    if (!session.url) {
      res.status(400).json({
        success: false,
        message: "Error while creating session",
      });
      return;
    }

    // Create a new course purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
      paymentId: session.id,
    });
    await newPurchase.save();

    res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    next(error);
  }
};

export const striptWebhook = async (req: Request, res: Response) => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = config.WEBHOOK_ENDPOINT_SECRET; // Direct assignment, no need to cast

    if (!secret) {
      return res.status(500).json({ message: "Webhook secret is missing." });
    }
    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: secret, // Ensure this is passed as a string
    });

    // Construct the event using the payload and header
    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Webhook Error:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    } else {
      console.error("Unknown Error:", error);
      return res.status(500).send("Webhook Error: An unknown error occurred");
    }
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object; // Stripe checkout session object
      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({
        path: "courseId", // Populate the courseId field to fetch the Course object
      });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      // Ensure `courseId` is populated and check its type
      if (!purchase.courseId || !(purchase.courseId instanceof Course)) {
        return res
          .status(400)
          .json({ message: "Course not properly populated." });
      }

      const course = purchase.courseId; // Safely access the populated Course document

      // If session amount is provided, update the purchase amount
      if (session.amount_total) {
        purchase.amount = session.amount_total / 100; // Convert from cents to INR
      }

      purchase.status = "complete"; // Mark the purchase as complete

      // Update the lectures
      if (course?.lectures?.length! > 0) {
        await Lecture.updateMany(
          { _id: { $in: course.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user with the enrolled course
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: course._id } },
        { new: true }
      );

      // Add the user to the enrolled students list for the course
      await Course.findByIdAndUpdate(
        course._id,
        { $addToSet: { enrolledStudent: purchase.userId } },
        { new: true }
      );

      // Respond with success
      return res.status(200).json({ message: "Purchase successful" });
    } catch (error) {
      console.error("Error processing checkout session:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(400).json({ message: "Unhandled event type" });
  }
};
