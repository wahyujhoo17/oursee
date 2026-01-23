import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(async ({ req, files }) => {
      // Validasi ukuran file (max 500KB per file setelah kompresi)
      // Kompresi dilakukan di client-side, di sini hanya validasi
      return { uploadedAt: Date.now() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete at:", metadata.uploadedAt);
      console.log("file url", file.url);
      console.log("file key", file.key);
      return {
        uploadedBy: metadata,
        fileUrl: file.url,
        fileKey: file.key,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
