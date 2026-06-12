import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { createOrder, getActiveOrders } from "@/lib/data";
import type { CreateOrderInput } from "@/types";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const orders = await getActiveOrders();
    return NextResponse.json(orders);
  } catch (err) {
    console.error("GET /api/orders failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to load orders. Check database schema.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const body = (await request.json()) as CreateOrderInput;

    if (!body.orderNo?.trim()) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    const order = await createOrder({ orderNo: body.orderNo.trim() });
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("POST /api/orders failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to create order. Check database schema.",
      },
      { status: 500 }
    );
  }
}
