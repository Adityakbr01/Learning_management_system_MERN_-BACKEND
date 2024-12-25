import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import {
  createCheckOutSesion,
  getAllPurchasedCourse,
  getCourseDetailWithPurchaseStatus,
  striptWebhook,
} from "./purchaseCourseController";

const Purchaserouter = express.Router();

Purchaserouter.post(
  "/checkout/create-checkout-session",
  isAuthenticated,
  createCheckOutSesion
);

Purchaserouter.post(
  "/webhook",
  express.raw({
    type: "application/json",
  }),
  striptWebhook
);
Purchaserouter.get(
  "/course/:courseId/detail-with-status",
  isAuthenticated,
  getCourseDetailWithPurchaseStatus
);
Purchaserouter.get("/", getAllPurchasedCourse);

export default Purchaserouter;
