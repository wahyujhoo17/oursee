import { prisma } from "@/lib/prisma";

const formatKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return { key: `${year}${month}`, year, month };
};

const main = async () => {
  const orders = await prisma.order.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const counters = new Map<string, number>();

  for (const order of orders) {
    const { key, year, month } = formatKey(order.createdAt);
    const current = counters.get(key) ?? 0;
    const next = current + 1;
    counters.set(key, next);

    const sequence = String(next).padStart(3, "0");
    const orderNumber = `ORD-${year}${month}-${sequence}`;

    await prisma.order.update({
      where: { id: order.id },
      data: { orderNumber },
    });
  }

  console.log(`Updated ${orders.length} orders.`);
};

main()
  .catch((error) => {
    console.error("Update failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
