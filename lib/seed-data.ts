import type { Order } from "@/types";

export const seedOrders: Order[] = [
  {
    id: "order_1",
    orderNo: "ORD-240601",
    orderDate: new Date("2024-06-01").toISOString(),
    quotationStatus: "COMPLETED",
    confirmationStatus: "PENDING",
    deliveryStatus: "PENDING",
    createdAt: new Date("2024-06-01").toISOString(),
    updatedAt: new Date("2024-06-02").toISOString(),
  },
  {
    id: "order_2",
    orderNo: "ORD-240605",
    orderDate: new Date("2024-06-05").toISOString(),
    quotationStatus: "COMPLETED",
    confirmationStatus: "CONFIRMED",
    deliveryStatus: "PENDING",
    createdAt: new Date("2024-06-05").toISOString(),
    updatedAt: new Date("2024-06-07").toISOString(),
  },
  {
    id: "order_3",
    orderNo: "ORD-240515",
    orderDate: new Date("2024-05-15").toISOString(),
    quotationStatus: "COMPLETED",
    confirmationStatus: "CONFIRMED",
    deliveryStatus: "COMPLETED",
    createdAt: new Date("2024-05-15").toISOString(),
    updatedAt: new Date("2024-05-25").toISOString(),
  },
];

export const ADMIN_PASSWORD_HASH =
  "$2b$10$KP2ATv/yjvia7pnDLOxf6eZO82plB4SUrlh/bvTJPPWcdUVKOUHBK";

export const seedUsers = [
  {
    id: "user_admin",
    username: "admin",
    password: ADMIN_PASSWORD_HASH,
    createdAt: new Date("2024-01-01").toISOString(),
  },
];
