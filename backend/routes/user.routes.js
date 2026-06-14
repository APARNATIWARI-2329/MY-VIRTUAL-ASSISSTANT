import express from "express";

import {
  getCurrentUser,
  updateAssistant,
  askToAssistant,
  clearHistory,
} from "../controllers/user.controllers.js";

import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get(
  "/current",
  isAuth,
  getCurrentUser
);

userRouter.put(
  "/update",
  isAuth,
  upload.single("assistantImage"),
  updateAssistant
);

userRouter.post(
  "/askToAssistant",
  isAuth,
  askToAssistant
);

userRouter.delete("/clearHistory", isAuth, clearHistory);

export default userRouter;