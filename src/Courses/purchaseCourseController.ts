import Stripe from "stripe";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/config";
import { Course } from "./coursesModel";
import { CoursePurchase } from "./purchaseCourseModel";
import { Lecture } from "../Lecture/lectureModel";
import User from "../user/userModel";

const stripe = new Stripe(config.SecretKey_STRIP!, {
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

export const striptWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = config.WEBHOOK_ENDPOINT_SECRET; // Direct assignment, no need to cast

    if (!secret) {
      res.status(500).json({ message: "Webhook secret is missing." });
      return;
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
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    } else {
      console.error("Unknown Error:", error);
      res.status(500).send("Webhook Error: An unknown error occurred");
      return;
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
        res.status(404).json({ message: "Purchase not found" });
        return;
      }

      // Ensure `courseId` is populated and check its type
      if (!purchase.courseId || !(purchase.courseId instanceof Course)) {
        res.status(400).json({ message: "Course not properly populated." });
        return;
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
      res.status(200).json({ message: "Purchase successful" });
      return;
    } catch (error) {
      console.error("Error processing checkout session:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  } else {
    res.status(400).json({ message: "Unhandled event type" });
    return;
  }
};

export const getCourseDetailWithPurchaseStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.id; // Ensure this is set in middleware

    if (!courseId) {
      res.status(400).json({ message: "Course ID is required." });
      return;
    }

    const course = await Course.findById(courseId)
      .populate("creator")
      .populate("lectures");

    if (!course) {
      res.status(404).json({ message: "Course not found!" });
      return;
    }

    const purchase = await CoursePurchase.findOne({ userId, courseId });

    res.status(200).json({
      message: "Course details retrieved successfully.",
      course,
      purchased: !!purchase, // Converts to boolean
    });
    return;
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({
      message: "An error occurred while fetching course details.",
    });
    return;
  }
};

export const getAllPurchasedCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const purchasedCourses = await CoursePurchase.find({
      status: "complete",
    }).populate("courseId");

    if (purchasedCourses.length === 0) {
      res.status(404).json({
        message: "No purchased courses found.",
        purchasedCourses: [],
      });
      return;
    }

    res.status(200).json({
      message: "Purchased courses retrieved successfully.",
      purchasedCourses,
    });
    return;
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    res.status(500).json({
      message: "An error occurred while fetching purchased courses.",
    });
    return;
  }
};
