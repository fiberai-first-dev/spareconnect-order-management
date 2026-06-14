import { AnimatePresence, useAnimate, usePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type OrderItem = {
  id: number;
  orderId: string;
  productCategory?: string;
  resolutionDate: string;
};

export type NewOrderInput = Omit<OrderItem, "id">;

type VanishListProps = {
  onAddOrder?: (order: NewOrderInput) => Promise<void> | void;
  existingOrderNos?: string[];
};

export const VanishList = ({ onAddOrder, existingOrderNos = [] }: VanishListProps) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);

  const removeElement = (id: number) => {
    setOrders((prev) => prev.filter((item) => item.id !== id));
  };

  const addOrder = async (order: NewOrderInput) => {
    if (onAddOrder) {
      await onAddOrder(order);
      return;
    }

    setOrders((prev) => [{ id: Math.random(), ...order }, ...prev]);
  };

  return (
    <section className="flex w-full flex-col">
      <OrderList orders={orders} removeElement={removeElement} />
      <AddOrderForm onAdd={addOrder} existingOrderNos={existingOrderNos} />
    </section>
  );
};

const AddOrderForm = ({
  onAdd,
  existingOrderNos,
}: {
  onAdd: (order: NewOrderInput) => Promise<void> | void;
  existingOrderNos: string[];
}) => {
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [resolutionDate, setResolutionDate] = useState("");

  const resetForm = () => {
    setOrderId("");
    setProductCategory("");
    setResolutionDate("");
    setFormError("");
  };

  const isDuplicateOrderId = (value: string) =>
    existingOrderNos.some(
      (existing) => existing.trim().toLowerCase() === value.trim().toLowerCase()
    );

  const handleSubmit = async () => {
    const trimmedOrderId = orderId.trim();

    if (!trimmedOrderId || !resolutionDate) {
      return;
    }

    if (isDuplicateOrderId(trimmedOrderId)) {
      setFormError("This order ID already exists. Enter a different ID.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      await onAdd({
        orderId: trimmedOrderId,
        productCategory: productCategory.trim() || undefined,
        resolutionDate,
      });
      resetForm();
      setVisible(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to add order."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-auto w-full pt-4">
      <AnimatePresence>
        {visible && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="mb-3 w-full space-y-3 rounded-xl border border-black/20 bg-white/95 p-4 shadow-lg shadow-black/10 backdrop-blur-md"
          >
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => {
                    setOrderId(e.target.value);
                    if (formError) setFormError("");
                  }}
                  placeholder="Enter order ID"
                  required
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productCategory">Product category (optional)</Label>
                <Input
                  id="productCategory"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  placeholder="Enter product category"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolutionDate">Resolution date</Label>
                <Input
                  id="resolutionDate"
                  type="date"
                  value={resolutionDate}
                  onChange={(e) => setResolutionDate(e.target.value)}
                  required
                />
              </div>

              {formError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                  {formError}
                </p>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Adding..." : "Add order"}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

      <div className="relative flex justify-center">
        <span className="absolute inset-0 m-auto size-12 animate-pulse-soft rounded-full bg-zinc-300/30" />
        <button
          type="button"
          onClick={() => {
            setVisible((prev) => !prev);
            if (visible) setFormError("");
          }}
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-gradient-to-br from-zinc-800 to-black text-white shadow-md shadow-black/20 transition-all hover:scale-110 hover:shadow-lg hover:shadow-black/30",
            !visible && "animate-float"
          )}
          aria-label={visible ? "Close add order form" : "Add order"}
        >
          <FiPlus
            className={`size-4 transition-transform ${visible ? "rotate-45" : "rotate-0"}`}
          />
        </button>
      </div>
    </div>
  );
};

const OrderList = ({
  orders,
  removeElement,
}: {
  orders: OrderItem[];
  removeElement: (id: number) => void;
}) => {
  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
      <AnimatePresence>
        {orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            removeElement={removeElement}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const OrderRow = ({
  removeElement,
  order,
}: {
  removeElement: (id: number) => void;
  order: OrderItem;
}) => {
  const { id, orderId, productCategory, resolutionDate } = order;
  const [isPresent, safeToRemove] = usePresence();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!isPresent) {
      const exitAnimation = async () => {
        await animate(
          scope.current,
          { scale: 1.02 },
          { ease: "easeIn", duration: 0.125 }
        );
        await animate(
          scope.current,
          { opacity: 0, x: -24 },
          { delay: 0.35 }
        );
        safeToRemove();
      };

      void exitAnimation();
    }
  }, [isPresent, animate, scope, safeToRemove]);

  return (
    <motion.div
      ref={scope}
      layout
      className="relative flex w-full flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-gray-900">Order ID: {orderId}</p>
        {productCategory && (
          <p className="text-xs text-gray-600">Category: {productCategory}</p>
        )}
        <p className="text-xs text-gray-500">
          Resolution date: {resolutionDate}
        </p>
      </div>

      <button
        type="button"
        onClick={() => removeElement(id)}
        className="self-end rounded bg-red-50 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-100 sm:self-center"
        aria-label="Remove order"
      >
        <FiTrash2 />
      </button>
    </motion.div>
  );
};
