import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          customer: true,
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, userId, items, deliveryMethod, pickupDate, pickupTime, deliveryDate, deliveryTime, recipientName, recipientPhone, deliveryAddress, notes } = body;

    // Calculate total
    const itemsTotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const addonsTotal = (body.addons?.greeting_card ? 5000 : 0) + (body.addons?.stick_card ? 5000 : 0);
    const totalAmount = itemsTotal + addonsTotal;

    // Generate order number: ORD-YYYYMM-###
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const monthStart = new Date(year, now.getMonth(), 1, 0, 0, 0, 0);
    const nextMonthStart = new Date(year, now.getMonth() + 1, 1, 0, 0, 0, 0);
    const monthlyCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
    });
    const sequence = String(monthlyCount + 1).padStart(3, "0");
    const orderNumber = `ORD-${year}${month}-${sequence}`;

    // Generate sequential pickup code (unique across all orders)
    const totalOrdersCount = await prisma.order.count();
    const pickupCodeNumber = String(totalOrdersCount + 1).padStart(2, "0");
    const pickupCode = `OS-${pickupCodeNumber}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        userId,
        totalAmount,
        deliveryMethod,
        pickupDate: pickupDate ? new Date(pickupDate) : null,
        pickupTime,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryTime,
        recipientName,
        recipientPhone,
        deliveryAddress,
        notes: `${notes}\n\nPickup Code: ${pickupCode}`,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
