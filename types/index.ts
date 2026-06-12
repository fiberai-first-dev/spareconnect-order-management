export type QuotationStatus = "PENDING" | "COMPLETED";
export type ConfirmationStatus = "PENDING" | "CONFIRMED";
export type SimpleDeliveryStatus = "PENDING" | "COMPLETED";

export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  orderDate: string;
  quotationStatus: QuotationStatus;
  confirmationStatus: ConfirmationStatus;
  deliveryStatus: SimpleDeliveryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  orderNo: string;
}

export type BadgeVariant = "orange" | "blue" | "amber" | "green" | "neutral";

export interface OrderBadge {
  label: string;
  variant: BadgeVariant;
}
