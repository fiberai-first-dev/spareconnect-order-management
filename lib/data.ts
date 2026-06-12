import { applySequentialStatusUpdate } from "@/lib/order-flow";
import { prisma } from "@/lib/prisma";
import * as store from "@/lib/store";
import type {
  ConfirmationStatus,
  CreateOrderInput,
  Order,
  QuotationStatus,
  SimpleDeliveryStatus,
  User,
} from "@/types";

export const useDB = !!process.env.DATABASE_URL;

function mapOrder(order: {
  id: string;
  orderNo: string;
  orderDate: Date;
  quotationStatus: QuotationStatus;
  confirmationStatus: ConfirmationStatus;
  deliveryStatus: SimpleDeliveryStatus;
  createdAt: Date;
  updatedAt: Date;
}): Order {
  return {
    id: order.id,
    orderNo: order.orderNo,
    orderDate: order.orderDate.toISOString(),
    quotationStatus: order.quotationStatus,
    confirmationStatus: order.confirmationStatus,
    deliveryStatus: order.deliveryStatus,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function getUserByUsername(username: string): Promise<User | null> {
  if (!useDB) {
    return store.getUserByUsername(username) ?? null;
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    password: user.password,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getActiveOrders(): Promise<Order[]> {
  if (!useDB) return store.getActiveOrders();

  try {
    const orders = await prisma.order.findMany({
      where: { deliveryStatus: { not: "COMPLETED" } },
      orderBy: { orderDate: "asc" },
    });
    return orders.map(mapOrder);
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? err.message
        : "Database error while loading orders"
    );
  }
}

export async function getHistoryOrders(): Promise<Order[]> {
  if (!useDB) return store.getHistoryOrders();

  const orders = await prisma.order.findMany({
    where: { deliveryStatus: "COMPLETED" },
    orderBy: { orderDate: "desc" },
  });

  return orders.map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!useDB) return store.getOrderById(id) ?? null;

  const order = await prisma.order.findUnique({ where: { id } });
  return order ? mapOrder(order) : null;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!useDB) return store.createOrder(input);

  try {
    const order = await prisma.order.create({
      data: { orderNo: input.orderNo.trim() },
    });
    return mapOrder(order);
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? err.message
        : "Database error while creating order"
    );
  }
}

export async function updateOrder(
  id: string,
  data: Partial<{
    orderNo: string;
    quotationStatus: QuotationStatus;
    confirmationStatus: ConfirmationStatus;
    deliveryStatus: SimpleDeliveryStatus;
  }>
): Promise<Order | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;

  const statusUpdate = applySequentialStatusUpdate(existing, data);
  if (statusUpdate === null) {
    throw new Error("Complete the previous step before advancing.");
  }

  const patch = { ...data, ...statusUpdate };

  if (!useDB) return store.updateOrder(id, patch);

  try {
    const order = await prisma.order.update({
      where: { id },
      data: patch,
    });
    return mapOrder(order);
  } catch {
    return null;
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  if (!useDB) return store.deleteOrder(id);

  try {
    await prisma.order.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
