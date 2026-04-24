import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.hampersItem.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching hampers items:", error);
    return NextResponse.json({ error: "Failed to fetch hampers items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, stock, unit, description } = body;

    if (!name || !category) {
      return NextResponse.json({ error: "name and category are required" }, { status: 400 });
    }

    const item = await prisma.hampersItem.create({
      data: {
        name,
        category,
        stock: stock ?? 0,
        unit: unit || "pcs",
        description: description || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating hampers item:", error);
    return NextResponse.json({ error: "Failed to create hampers item" }, { status: 500 });
  }
}
