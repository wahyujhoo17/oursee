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
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.expense.findMany({
        where: {
          expenseDate: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        select: {
          id: true,
          category: true,
          description: true,
          amount: true,
          expenseDate: true,
        },
        orderBy: { expenseDate: "asc" },
      }),
      prisma.openingBalance.findMany({
        orderBy: { createdAt: "desc" },
        take: 1,
      }),
    ]);

    const openingBalance = openingBalances[0]?.amount || 0;

    const entries = [
      {
        date: monthStart,
        type: "opening",
        description: "Saldo awal bulan ini",
        income: 0,
        expense: 0,
        balance: openingBalance,
      },
      ...orders.map((order) => ({
        date: order.createdAt,
        type: "income",
        description: `Pendapatan ${order.orderNumber}`,
        income: Number(order.totalAmount || 0),
        expense: 0,
        balance: 0,
      })),
      ...expenses.map((item) => ({
        date: item.expenseDate,
        type: "expense",
        description: `${item.category} - ${item.description}`,
        income: 0,
        expense: Number(item.amount || 0),
        balance: 0,
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = openingBalance;
    const ledger = entries.map((entry) => {
      if (entry.type === "income") {
        runningBalance += Number(entry.income || 0);
      }
      if (entry.type === "expense") {
        runningBalance -= Number(entry.expense || 0);
      }

      return {
        ...entry,
        balance: runningBalance,
      };
    });

    const totalRevenue = orders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const closingBalance = openingBalance + totalRevenue - totalExpenses;
    const grossProfit = totalRevenue - totalExpenses;

    return NextResponse.json(
      {
        monthLabel: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(now),
        openingBalance,
        totalRevenue,
        totalExpenses,
        closingBalance,
        grossProfit,
        totalOrders: orders.length,
        ledger,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching finance ledger:", error);
    return NextResponse.json({ error: "Failed to fetch finance ledger" }, { status: 500 });
  }
}
