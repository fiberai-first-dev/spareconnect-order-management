"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { OrderCard, type OrderCardStage } from "@/components/orders/OrderCard";
import { readErrorMessage, readJsonResponse } from "@/lib/api-utils";
import { VanishList, type NewOrderInput } from "@/components/orders/OrderManage";
import { getOrderStage, sortOrdersByPriority } from "@/lib/order-flow";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

type SectionVariant = OrderCardStage;

const sectionThemes: Record<
  SectionVariant,
  {
    icon: string;
    gradient: string;
    border: string;
    accent: string;
    badge: string;
    glow: string;
  }
> = {
  quotation: {
    icon: "01",
    gradient: "from-zinc-50 via-white/90 to-neutral-100/50",
    border: "border-black/20",
    accent: "from-zinc-700 to-black",
    badge: "bg-zinc-100 text-zinc-800 ring-zinc-300",
    glow: "shadow-[0_10px_40px_rgba(0,0,0,0.12)]",
  },
  confirmation: {
    icon: "02",
    gradient: "from-neutral-100/70 via-white/90 to-zinc-50/60",
    border: "border-black/25",
    accent: "from-neutral-600 to-zinc-900",
    badge: "bg-neutral-100 text-neutral-800 ring-neutral-300",
    glow: "shadow-[0_10px_40px_rgba(0,0,0,0.14)]",
  },
  delivery: {
    icon: "03",
    gradient: "from-stone-100/70 via-white/90 to-gray-50/60",
    border: "border-black/30",
    accent: "from-stone-700 to-black",
    badge: "bg-stone-100 text-stone-800 ring-stone-300",
    glow: "shadow-[0_10px_40px_rgba(0,0,0,0.16)]",
  },
};

function OrderSection({
  title,
  description,
  children,
  count,
  variant,
  delay = 0,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  count: number;
  variant: SectionVariant;
  delay?: number;
}) {
  const theme = sectionThemes[variant];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className={cn(
        "relative flex h-[320px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border p-4 backdrop-blur-sm md:h-[440px] md:p-5",
        theme.border,
        theme.glow,
        `bg-gradient-to-br ${theme.gradient}`
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          theme.accent
        )}
      />
      <div className="mb-4 flex shrink-0 items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs text-white shadow-md md:size-9 md:text-sm",
              theme.accent
            )}
          >
            {theme.icon}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-zinc-900 md:text-base">
              {title}
            </h2>
            <p className="mt-0.5 hidden text-sm text-zinc-500 md:block">
              {description}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
            theme.badge
          )}
        >
          {count}
        </span>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </motion.section>
  );
}

/** Scrollable list fills remaining space inside each equal-height section */
const columnListClass = "h-full min-h-0 w-full overflow-y-auto";

function OrderListContent({
  orders,
  stage,
  emptyMessage,
  onUpdate,
  onDelete,
}: {
  orders: Order[];
  stage: OrderCardStage;
  emptyMessage: string;
  onUpdate: (order: Order) => void;
  onDelete: (id: string) => void;
}) {
  if (orders.length === 0) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {orders.map((order, index) => (
        <OrderCard
          key={order.id}
          order={order}
          stage={stage}
          index={index}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [historyOrderNos, setHistoryOrderNos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setError("");
    try {
      const [ordersRes, historyRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/history"),
      ]);

      if (!ordersRes.ok) {
        throw new Error(await readErrorMessage(ordersRes));
      }

      setOrders(await readJsonResponse<Order[]>(ordersRes));

      if (historyRes.ok) {
        const history = await readJsonResponse<Order[]>(historyRes);
        setHistoryOrderNos(history.map((order) => order.orderNo));
      } else {
        setHistoryOrderNos([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
      setOrders([]);
      setHistoryOrderNos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleAddOrder(order: NewOrderInput) {
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo: order.orderId,
          storeName: order.storeName,
          productCategory: order.productCategory,
          resolutionDate: order.resolutionDate,
        }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      const created = await readJsonResponse<Order>(res);
      setOrders((prev) => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add order");
      throw err;
    }
  }

  function handleOrderUpdate(updated: Order) {
    if (updated.deliveryStatus === "COMPLETED") {
      setOrders((prev) => prev.filter((o) => o.id !== updated.id));
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
    }
  }

  function handleOrderDelete(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  const existingOrderNos = useMemo(
    () => [...orders.map((order) => order.orderNo), ...historyOrderNos],
    [orders, historyOrderNos]
  );

  const quotationOrders = useMemo(
    () =>
      sortOrdersByPriority(
        orders.filter((order) => getOrderStage(order) === "quotation"),
        "quotation"
      ),
    [orders]
  );

  const confirmationOrders = useMemo(
    () =>
      sortOrdersByPriority(
        orders.filter((order) => getOrderStage(order) === "confirmation"),
        "confirmation"
      ),
    [orders]
  );

  const deliveryOrders = useMemo(
    () =>
      sortOrdersByPriority(
        orders.filter((order) => getOrderStage(order) === "delivery"),
        "delivery"
      ),
    [orders]
  );

  return (
    <div className="relative px-4 py-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 md:text-xl">
          Order status
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track orders through quotation, confirmation, and delivery.
        </p>
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 rounded-lg border border-zinc-300 bg-zinc-100/90 px-3 py-2 text-sm text-zinc-800 backdrop-blur-sm"
        >
          {error}
        </motion.p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[320px] animate-pulse rounded-2xl border border-zinc-200/80 bg-zinc-100/60 backdrop-blur-sm md:h-[440px]"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
            <OrderSection
              title="Quotation Pending"
              description="Create a new order and complete quotation."
              count={quotationOrders.length}
              variant="quotation"
              delay={0}
            >
              <div className={columnListClass}>
                <OrderListContent
                  orders={quotationOrders}
                  stage="quotation"
                  emptyMessage="No orders awaiting quotation."
                  onUpdate={handleOrderUpdate}
                  onDelete={handleOrderDelete}
                />
              </div>
            </OrderSection>

            <OrderSection
              title="Awaiting confirmation"
              description="Orders with quotation completed, waiting for confirmation."
              count={confirmationOrders.length}
              variant="confirmation"
              delay={0.08}
            >
              <div className={columnListClass}>
                <OrderListContent
                  orders={confirmationOrders}
                  stage="confirmation"
                  emptyMessage="No orders awaiting confirmation."
                  onUpdate={handleOrderUpdate}
                  onDelete={handleOrderDelete}
                />
              </div>
            </OrderSection>

            <OrderSection
              title="Delivery pending"
              description="Confirmed orders waiting for delivery."
              count={deliveryOrders.length}
              variant="delivery"
              delay={0.16}
            >
              <div className={columnListClass}>
                <OrderListContent
                  orders={deliveryOrders}
                  stage="delivery"
                  emptyMessage="No orders pending delivery."
                  onUpdate={handleOrderUpdate}
                  onDelete={handleOrderDelete}
                />
              </div>
            </OrderSection>
          </div>

          <div className="mt-8 flex justify-center md:mt-10">
            <VanishList
              onAddOrder={handleAddOrder}
              existingOrderNos={existingOrderNos}
            />
          </div>
        </>
      )}
    </div>
  );
}
