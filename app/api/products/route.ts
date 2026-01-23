import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET all products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productCode, name, description, price, images, categoryNames } =
      body;

    // Validate required fields
    if (!productCode || !name) {
      return NextResponse.json(
        { error: "Product code and name are required" },
        { status: 400 },
      );
    }

    // Check if product code already exists
    const existingProduct = await prisma.product.findUnique({
      where: { productCode },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product code already exists" },
        { status: 400 },
      );
    }

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

    // Create product with images and categories
    const product = await prisma.product.create({
      data: {
        productCode,
        name,
        description,
        price: price ? parseFloat(price) : null,
        images: {
          create:
            images?.map((img: any, index: number) => ({
              imageUrl: img.url,
              isMain: img.isMain || index === 0,
              order: img.order || index,
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}

// DELETE product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
