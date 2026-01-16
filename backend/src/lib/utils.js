import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const token = jwt.sign(
    { id: userId },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,          // 🔴 REQUIRED for HTTPS (Render)
    sameSite: "none",      // 🔴 REQUIRED for Vercel ↔ Render
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
