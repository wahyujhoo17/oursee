import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET single product by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, description, price, images, categoryNames } = body;

    // Get existing images before deleting
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Extract file keys from old images that will be removed
    const oldImageUrls = existingProduct.images.map((img) => img.imageUrl);
    const newImageUrls = images?.map((img: any) => img.url) || [];
    const removedImageUrls = oldImageUrls.filter(
      (url) => !newImageUrls.includes(url),
    );

    const fileKeysToDelete = removedImageUrls
      .map((url) => {
        const match = url.match(/\/f\/([^\/]+)$/);
        return match ? match[1] : null;
      })
      .filter((key): key is string => key !== null);

    // Delete existing images and categories
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    await prisma.productCategory.deleteMany({
      where: { productId: id },
    });

    // Process categories: find existing or create new
    const categoryIds: string[] = [];
    if (categoryNames && categoryNames.length > 0) {
      for (const categoryName of categoryNames) {
        const slug = categoryName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Find or create category
        let category = await prisma.category.findUnique({
          where: { slug },
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: categoryName,
              slug,
            },
          });
        }

        categoryIds.push(category.id);
      }
    }

    // Update product with new images and categories
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : null,
        images: {
          create:
            images?.map((img: any, index: number) => ({
              imageUrl: img.url,
              isMain: img.isMain === true, // Explicitly check for true
              order: index,
            })) || [],
        },
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            categoryId,
          })),
        },
      },
      include: {
        images: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Delete old files from UploadThing if there are any
    if (fileKeysToDelete.length > 0) {
      try {
        await fetch(`${request.nextUrl.origin}/api/uploadthing/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileKeys: fileKeysToDelete }),
        });
        console.log(
          `Deleted ${fileKeysToDelete.length} old file(s) from UploadThing`,
        );
      } catch (error) {
        console.error("Failed to delete old files from UploadThing:", error);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    // Get product with images to get file keys before deleting
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Extract file keys from image URLs
    const fileKeys = product.images
      .map((img) => {
        // Extract key from UploadThing URL
        // URL format: https://utfs.io/f/{fileKey}
        const match = img.imageUrl.match(/\/f\/([^\/]+)$/);
        return match ? match[1] : null;
      })
      .filter((key): key is string => key !== null);

    // Delete product from database (will cascade delete images)
    await prisma.product.delete({
      where: { id },
    });

    // Delete files from UploadThing if there are any
    if (fileKeys.length > 0) {
      try {
        await fetch(`${request.nextUrl.origin}/api/uploadthing/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileKeys }),
        });
        console.log(`Deleted ${fileKeys.length} file(s) from UploadThing`);
      } catch (error) {
        console.error("Failed to delete files from UploadThing:", error);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
