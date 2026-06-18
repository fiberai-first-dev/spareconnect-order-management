"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { OrderCard, type OrderCardStage } from "@/components/orders/OrderCard";
import { readErrorMessage, readJsonResponse } from "@/lib/api-utils";
import { AddOrderForm, type NewOrderInput } from "@/components/orders/OrderManage";
import { getOrderStage, sortOrdersByPriority } from "@/lib/order-flow";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

type SectionVariant = OrderCardStage;

const sectionThemes: Record<
  SectionVariant,
  {
    gradient: string;
    border: string;
    accent: string;
    glow: string;
  }
> = {
  quotation: {
    gradient: "from-zinc-50 via-white/90 to-neutral-100/50",
    border: "border-black/20",
    accent: "from-zinc-700 to-black",
    glow: "shadow-[0_10px_40px_rgba(0,0,0,0.12)]",
  },
  confirmation: {
    gradient: "from-neutral-100/70 via-white/90 to-zinc-50/60",
    border: "border-black/25",
    accent: "from-neutral-600 to-zinc-900",
    glow: "shadow-[0_10px_40px_rgba(0,0,0,0.14)]",
  },
  delivery: {
    gradient: "from-stone-100/70 via-white/90 to-gray-50/60",
    border: "border-black/30",
    accent: "from-stone-700 to-black",
    glow: "shadow-[0_10px_40px_rgba(0,0,0,0.16)]",
  },
};

function OrderSection({
  title,
  children,
  count,
  variant,
  delay = 0,
}: {
  title: string;
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
        "relative flex h-[320px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border p-4 backdrop-blur-sm md:h-[calc(100vh-9rem)] md:p-5",
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
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "flex h-8 min-w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br px-1.5 text-xs font-semibold text-white shadow-md md:h-9 md:min-w-9 md:text-sm",
            theme.accent
          )}
        >
          {count}
        </span>
        <h2 className="min-w-0 truncate text-sm font-semibold text-zinc-900 md:text-base">
          {title}
        </h2>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
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
        body: JSON.stringify({ orderNo: order.orderId }),
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
              className="h-[320px] animate-pulse rounded-2xl border border-zinc-200/80 bg-zinc-100/60 backdrop-blur-sm md:h-[calc(100vh-9rem)]"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
            <OrderSection
              title="Quotation Pending"
              count={quotationOrders.length}
              variant="quotation"
              delay={0}
            >
              <AddOrderForm
                onAdd={handleAddOrder}
                existingOrderNos={existingOrderNos}
              />
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
        </>
      )}
    </div>
  );
}
