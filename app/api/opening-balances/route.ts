import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const balances = await prisma.openingBalance.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(balances, { status: 200 });
  } catch (error) {
    console.error("Error fetching opening balances:", error);
    return NextResponse.json({ error: "Failed to fetch opening balances" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, date, description } = body;

    if (amount === undefined || !date) {
      return NextResponse.json({ error: "Amount and date are required" }, { status: 400 });
    }

    const balance = await prisma.openingBalance.create({
      data: {
        amount: Number(amount),
        date: new Date(date),
        description: description || "Saldo awal",
      },
    });

    return NextResponse.json(balance, { status: 201 });
  } catch (error) {
    console.error("Error creating opening balance:", error);
    return NextResponse.json({ error: "Failed to create opening balance" }, { status: 500 });
  }
}
