import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import geminiResponse from "./gemini.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// app.get("/", async (req, res) => {
//   try {
//     const prompt = req.query.prompt;
//     if (!prompt) {
//       return res.status(400).json({
//         message: "Prompt is required",
//       });
//     }
//     const data = await geminiResponse(prompt);
//     res.json(data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "Internal Server Error",
//     });
//   }
// });

app.listen(port, () => {
  connectDb();

  console.log(`Server running on port ${port}`);
});