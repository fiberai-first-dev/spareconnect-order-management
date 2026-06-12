"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderStatusFilterBar } from "@/components/orders/OrderStatusFilterBar";
import { OrderStatusSummary } from "@/components/orders/OrderStatusSummary";
import { readErrorMessage, readJsonResponse } from "@/lib/api-utils";
import {
  getOrderStageCounts,
  orderMatchesPeriodFilter,
  orderMatchesStageFilter,
  sortOrdersByPriority,
  type OrderPeriodFilter,
  type OrderStageFilter,
} from "@/lib/order-flow";
import type { Order } from "@/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderNo, setOrderNo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [stageFilter, setStageFilter] = useState<OrderStageFilter>("all");
  const [periodFilter, setPeriodFilter] =
    useState<OrderPeriodFilter>("last7days");

  const loadOrders = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }
      setOrders(await readJsonResponse<Order[]>(res));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleAddOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const value = orderNo.trim();
    if (!value) {
      setError("Enter an order number.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo: value }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      const created = await readJsonResponse<Order>(res);
      setOrders((prev) => [created, ...prev]);
      setOrderNo("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add order");
    } finally {
      setSaving(false);
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

  const periodFilteredOrders = useMemo(
    () => orders.filter((order) => orderMatchesPeriodFilter(order, periodFilter)),
    [orders, periodFilter]
  );

  const stageCounts = useMemo(
    () => getOrderStageCounts(periodFilteredOrders),
    [periodFilteredOrders]
  );

  const visibleOrders = useMemo(
    () =>
      sortOrdersByPriority(
        periodFilteredOrders.filter((order) =>
          orderMatchesStageFilter(order, stageFilter)
        ),
        stageFilter
      ),
    [periodFilteredOrders, stageFilter]
  );

  return (
    <div className="px-4 py-4 md:p-8">
      <h1 className="mb-4 text-lg font-semibold text-gray-900 md:mb-6 md:text-xl">
        Order status
      </h1>

      <div className="mb-4 md:mb-6">
        <OrderStatusSummary
          counts={stageCounts}
          activeFilter={stageFilter}
          onFilterChange={setStageFilter}
        />
      </div>

      <div className="mb-4 md:mb-6">
        <OrderStatusFilterBar
          counts={stageCounts}
          activeFilter={stageFilter}
          onFilterChange={setStageFilter}
          periodFilter={periodFilter}
          onPeriodChange={setPeriodFilter}
        />
      </div>

      <form
        onSubmit={handleAddOrder}
        className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="w-full space-y-2 sm:w-auto">
          <Label htmlFor="orderNo">Order no. / serial no.</Label>
          <Input
            id="orderNo"
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            placeholder="e.g. 11"
            className="w-full sm:w-56"
          />
        </div>
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Adding..." : "Add order"}
        </Button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading orders...</p>
      ) : visibleOrders.length === 0 ? (
        <p className="text-sm text-gray-500">
          {orders.length === 0
            ? "No active orders. Add one above."
            : periodFilteredOrders.length === 0
              ? "No orders in this period."
              : "No orders match this filter."}
        </p>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdate={handleOrderUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
