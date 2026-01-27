import sharp from "sharp";

const MAX_SIZE_KB = 200;
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

export async function compressImage(file: File): Promise<File> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let quality = 90;
    let compressedBuffer: Buffer = buffer;
    let metadata = await sharp(buffer).metadata();

    // Resize jika gambar terlalu besar (max width 1920px)
    let pipeline = sharp(buffer);

    if (metadata.width && metadata.width > 1920) {
      pipeline = pipeline.resize(1920, undefined, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Compress dengan kualitas yang berkurang sampai ukuran < 500KB
    while (quality > 10) {
      compressedBuffer = (await pipeline
        .jpeg({ quality, mozjpeg: true })
        .toBuffer()) as any;

      if (compressedBuffer.length <= MAX_SIZE_BYTES) {
        break;
      }

      quality -= 10;
      pipeline = sharp(buffer);
      if (metadata.width && metadata.width > 1920) {
        pipeline = pipeline.resize(1920, undefined, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }
    }

    // Jika masih lebih besar, resize lebih kecil lagi
    if (compressedBuffer && compressedBuffer.length > MAX_SIZE_BYTES) {
      let width = metadata.width || 1920;
      while (width > 640 && compressedBuffer.length > MAX_SIZE_BYTES) {
        width = Math.floor(width * 0.8);
        compressedBuffer = (await sharp(buffer)
          .resize(width, undefined, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80, mozjpeg: true })
          .toBuffer()) as any;
      }
    }

    // Convert Buffer kembali ke File
    const compressedFile = new File([compressedBuffer as any], file.name, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    const originalSizeKB = (file.size / 1024).toFixed(2);
    const compressedSizeKB = (compressedFile.size / 1024).toFixed(2);
    console.log(
      `Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB (${Math.round((compressedFile.size / file.size) * 100)}%)`,
    );

    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    throw new Error("Failed to compress image");
  }
}
