import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getHistoryOrders } from "@/lib/data";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  const orders = await getHistoryOrders();
  return NextResponse.json(orders);
}
