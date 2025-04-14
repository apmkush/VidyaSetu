import { v2 as cloudinary } from "cloudinary";

import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary config (optional but recommended)
try {
  await cloudinary.api.ping(); // Test connection
  console.log("✅ Cloudinary connected successfully");
} catch (err) {
  console.error("❌ Cloudinary connection failed:", err.message);
}

export default cloudinary;