import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    { id: userId }, // ✅ consistent payload
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: ENV.NODE_ENV === "production", // ✅ required on HTTPS
    sameSite: "none", // ✅ REQUIRED for Vercel ↔ Render
  });

  return token;
};
