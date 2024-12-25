import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import {
  createCheckOutSesion,
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
Purchaserouter.get("/course/:courseId/detail-with-status");
Purchaserouter.get("/");

export default Purchaserouter;
