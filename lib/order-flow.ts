import type {
  ConfirmationStatus,
  Order,
  QuotationStatus,
  SimpleDeliveryStatus,
} from "@/types";

export type OrderStatusUpdate = Partial<{
  quotationStatus: QuotationStatus;
  confirmationStatus: ConfirmationStatus;
  deliveryStatus: SimpleDeliveryStatus;
}>;

export function canAdvanceConfirmation(order: Order): boolean {
  return order.quotationStatus === "COMPLETED";
}

export function canAdvanceDelivery(order: Order): boolean {
  return order.confirmationStatus === "CONFIRMED";
}

export function applySequentialStatusUpdate(
  order: Order,
  update: OrderStatusUpdate
): OrderStatusUpdate | null {
  if (update.quotationStatus !== undefined) {
    if (update.quotationStatus === "COMPLETED") {
      return { quotationStatus: "COMPLETED" };
    }

    return {
      quotationStatus: "PENDING",
      confirmationStatus: "PENDING",
      deliveryStatus: "PENDING",
    };
  }

  if (update.confirmationStatus !== undefined) {
    if (update.confirmationStatus === "CONFIRMED") {
      if (order.quotationStatus !== "COMPLETED") return null;
      return { confirmationStatus: "CONFIRMED" };
    }

    return {
      confirmationStatus: "PENDING",
      deliveryStatus: "PENDING",
    };
  }

  if (update.deliveryStatus !== undefined) {
    if (update.deliveryStatus === "COMPLETED") {
      if (order.confirmationStatus !== "CONFIRMED") return null;
      return { deliveryStatus: "COMPLETED" };
    }

    return { deliveryStatus: "PENDING" };
  }

  return null;
}

export interface OrderStageCounts {
  quotationPending: number;
  confirmationPending: number;
  deliveryPending: number;
}

export function getOrderStageCounts(orders: Order[]): OrderStageCounts {
  return orders.reduce(
    (counts, order) => {
      if (order.quotationStatus === "PENDING") {
        counts.quotationPending += 1;
      } else if (order.confirmationStatus === "PENDING") {
        counts.confirmationPending += 1;
      } else if (order.deliveryStatus === "PENDING") {
        counts.deliveryPending += 1;
      }
      return counts;
    },
    {
      quotationPending: 0,
      confirmationPending: 0,
      deliveryPending: 0,
    }
  );
}

export type OrderStageFilter = "all" | "quotation" | "confirmation" | "delivery";

export function getOrderStage(
  order: Order
): Exclude<OrderStageFilter, "all"> {
  if (order.quotationStatus === "PENDING") return "quotation";
  if (order.confirmationStatus === "PENDING") return "confirmation";
  return "delivery";
}

export function orderMatchesStageFilter(
  order: Order,
  filter: OrderStageFilter
): boolean {
  if (filter === "all") return true;
  return getOrderStage(order) === filter;
}

function getStagePriority(order: Order): number {
  if (
    order.confirmationStatus === "CONFIRMED" &&
    order.deliveryStatus === "PENDING"
  ) {
    return 3;
  }
  if (
    order.quotationStatus === "COMPLETED" &&
    order.confirmationStatus === "PENDING"
  ) {
    return 2;
  }
  return 1;
}

function getEntryDate(order: Order): number {
  return new Date(order.orderDate).getTime();
}

export function sortOrdersByPriority(
  orders: Order[],
  filter: OrderStageFilter = "all"
): Order[] {
  return [...orders].sort((a, b) => {
    if (filter === "all") {
      const stageDiff = getStagePriority(b) - getStagePriority(a);
      if (stageDiff !== 0) return stageDiff;
    }
    return getEntryDate(a) - getEntryDate(b);
  });
}

export function getNextStatusAdvance(order: Order): OrderStatusUpdate | null {
  if (order.quotationStatus === "PENDING") {
    return { quotationStatus: "COMPLETED" };
  }
  if (order.confirmationStatus === "PENDING") {
    return { confirmationStatus: "CONFIRMED" };
  }
  if (order.deliveryStatus === "PENDING") {
    return { deliveryStatus: "COMPLETED" };
  }
  return null;
}

export function getNextStatusActionLabel(order: Order): string | null {
  if (order.quotationStatus === "PENDING") return "Complete quotation";
  if (order.confirmationStatus === "PENDING") return "Confirm order";
  if (order.deliveryStatus === "PENDING") return "Mark delivered";
  return null;
}

export function getNextStatusCardActionLabel(order: Order): string | null {
  if (order.quotationStatus === "PENDING") return "Mark quoted →";
  if (order.confirmationStatus === "PENDING") return "Confirm order →";
  if (order.deliveryStatus === "PENDING") return "Mark delivered →";
  return null;
}

export function getDaysSinceAdded(order: Order, now: Date = new Date()): number {
  const added = startOfDay(new Date(order.orderDate));
  const today = startOfDay(now);
  return Math.floor((today.getTime() - added.getTime()) / (24 * 60 * 60 * 1000));
}

export function formatDaysAgoLabel(order: Order, now: Date = new Date()): string {
  const days = getDaysSinceAdded(order, now);
  return `${days}d`;
}

export type AgeBadgeTone = "fresh" | "aging" | "stale" | "urgent";

export function getAgeBadgeTone(order: Order, now: Date = new Date()): AgeBadgeTone {
  const days = getDaysSinceAdded(order, now);
  if (days >= 7) return "urgent";
  if (days >= 3) return "stale";
  if (days >= 1) return "aging";
  return "fresh";
}

export const STAGE_FILTER_LABELS: Record<
  Exclude<OrderStageFilter, "all">,
  string
> = {
  quotation: "Quotation pending",
  confirmation: "Awaiting confirmation",
  delivery: "Delivery pending",
};

export type OrderPeriodFilter = "today" | "yesterday" | "last7days" | "all";

export const PERIOD_FILTER_LABELS: Record<OrderPeriodFilter, string> = {
  today: "Today",
  yesterday: "Yesterday",
  last7days: "Last 7 days",
  all: "All",
};

export const PERIOD_FILTER_OPTIONS: OrderPeriodFilter[] = [
  "today",
  "yesterday",
  "last7days",
  "all",
];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function orderMatchesPeriodFilter(
  order: Order,
  filter: OrderPeriodFilter,
  now: Date = new Date()
): boolean {
  if (filter === "all") return true;

  const orderDate = new Date(order.orderDate);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  if (filter === "today") {
    return orderDate >= todayStart && orderDate <= todayEnd;
  }

  if (filter === "yesterday") {
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    return (
      orderDate >= yesterdayStart && orderDate <= endOfDay(yesterdayStart)
    );
  }

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  return orderDate >= weekStart && orderDate <= todayEnd;
}
