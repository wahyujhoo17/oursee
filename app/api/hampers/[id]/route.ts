import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, stock, unit, description } = body;

    const item = await prisma.hampersItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(stock !== undefined && { stock }),
        ...(unit !== undefined && { unit }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating hampers item:", error);
    return NextResponse.json({ error: "Failed to update hampers item" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.hampersItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hampers item:", error);
    return NextResponse.json({ error: "Failed to delete hampers item" }, { status: 500 });
  }
}
