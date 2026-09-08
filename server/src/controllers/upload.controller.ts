import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

function imageFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"));
}

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

function uploadBuffer(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER,
        resource_type: "image",
        public_id: filename.replace(/\.[^.]+$/, ""),
      },
      (error, result) => {
        if (error || !result?.secure_url)
          reject(error ?? new Error("Cloudinary upload failed"));
        else resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

// POST /api/uploads — multipart "photos" (≤10 images, ≤5MB each).
// Files go straight to Cloudinary; returns secure urls for photoUrls.
export async function uploadPhotos(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0)
    return res.status(400).json({ error: "At least one photo is required" });

  try {
    const urls = await Promise.all(
      files.map((f, i) =>
        uploadBuffer(f.buffer, `${Date.now()}-${i}-${f.originalname}`),
      ),
    );
    return res.status(201).json({ urls });
  } catch (error) {
    console.error("Error uploading photos to Cloudinary:", error);
    return res.status(502).json({ error: "Photo upload failed. Please try again." });
  }
}

// Multer/limit errors → 400 JSON instead of Express's default HTML 500.
export function uploadErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof multer.MulterError)
    return res.status(400).json({ error: err.message });
  if (err instanceof Error && err.message === "Only image files are allowed")
    return res.status(400).json({ error: err.message });
  return next(err);
}
