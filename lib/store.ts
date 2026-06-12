import { seedOrders, seedUsers } from "@/lib/seed-data";
import type {
  ConfirmationStatus,
  CreateOrderInput,
  Order,
  QuotationStatus,
  SimpleDeliveryStatus,
  User,
} from "@/types";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export const users: User[] = clone(seedUsers as User[]);
export let orders: Order[] = clone(seedOrders);

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

export function getUserByUsername(username: string): User | undefined {
  return users.find((u) => u.username === username);
}

export function getActiveOrders(): Order[] {
  return orders
    .filter((o) => o.deliveryStatus !== "COMPLETED")
    .map(clone)
    .sort(
      (a, b) =>
        new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
    );
}

export function getHistoryOrders(): Order[] {
  return orders
    .filter((o) => o.deliveryStatus === "COMPLETED")
    .map(clone)
    .sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
}

export function getOrderById(id: string): Order | undefined {
  const order = orders.find((o) => o.id === id);
  return order ? clone(order) : undefined;
}

export function createOrder(input: CreateOrderInput): Order {
  const timestamp = now();
  const order: Order = {
    id: generateId("order"),
    orderNo: input.orderNo.trim(),
    orderDate: timestamp,
    quotationStatus: "PENDING",
    confirmationStatus: "PENDING",
    deliveryStatus: "PENDING",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  orders.push(order);
  return clone(order);
}

export function updateOrder(
  id: string,
  data: Partial<{
    orderNo: string;
    quotationStatus: QuotationStatus;
    confirmationStatus: ConfirmationStatus;
    deliveryStatus: SimpleDeliveryStatus;
  }>
): Order | null {
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  Object.assign(order, data, { updatedAt: now() });
  return clone(order);
}

export function deleteOrder(id: string): boolean {
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return false;
  orders.splice(index, 1);
  return true;
}
