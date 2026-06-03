import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

    const [orders, expenses, openingBalances] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        select: { totalAmount: true },
      }),
      prisma.expense.findMany({
        where: {
          expenseDate: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        select: { amount: true },
      }),
      prisma.openingBalance.findMany({
        orderBy: { createdAt: "desc" },
        take: 1,
      }),
    ]);

    const totalRevenue = orders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const openingBalance = openingBalances[0]?.amount || 0;
    const closingBalance = openingBalance + totalRevenue - totalExpenses;
    const grossProfit = totalRevenue - totalExpenses;

    return NextResponse.json(
      {
        openingBalance,
        totalRevenue,
        totalExpenses,
        closingBalance,
        grossProfit,
        totalOrders: orders.length,
        monthLabel: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(now),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching finance summary:", error);
    return NextResponse.json({ error: "Failed to fetch finance summary" }, { status: 500 });
  }
}
