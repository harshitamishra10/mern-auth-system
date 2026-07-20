import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import { authLimiter } from "./middleware/rateLimiter.js";

const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mern-auth-system-frontend.onrender.com",
      "https://multi-auth-system.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authLimiter, authRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Server Running",
  });
});
export default app;
