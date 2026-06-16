import { AnimatePresence, useAnimate, usePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type OrderItem = {
  id: number;
  orderId: string;
  storeName?: string;
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
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [desktopFormOpen, setDesktopFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [resolutionDate, setResolutionDate] = useState("");

  const resetForm = () => {
    setOrderId("");
    setStoreName("");
    setProductCategory("");
    setResolutionDate("");
    setFormError("");
  };

  const closeAll = () => {
    setMobileDialogOpen(false);
    setDesktopFormOpen(false);
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
        storeName: storeName.trim() || undefined,
        productCategory: productCategory.trim() || undefined,
        resolutionDate,
      });
      resetForm();
      closeAll();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to add order."
      );
    } finally {
      setSaving(false);
    }
  };

  const formFields = (
    <>
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
        <Label htmlFor="storeName">Store name (optional)</Label>
        <Input
          id="storeName"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Enter store name"
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
    </>
  );

  return (
    <div className="flex flex-col items-center">
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileDialogOpen(true)}
          className="rounded-lg border border-black/20 bg-white px-5 py-2 text-sm font-semibold text-zinc-900 shadow-sm shadow-black/10 transition-all hover:border-black/40 hover:shadow-md hover:shadow-black/15"
        >
          Add order
        </button>

        <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
          <DialogContent className="max-w-md border border-black/20 bg-white/95 shadow-xl shadow-black/15 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Add order</DialogTitle>
              <DialogDescription>
                Enter order details to create a new order.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
            >
              {formFields}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="hidden md:flex md:flex-col md:items-center md:justify-center">
        <button
          type="button"
          onClick={() => {
            setDesktopFormOpen((prev) => !prev);
            if (desktopFormOpen) setFormError("");
          }}
          className="rounded-lg border border-black/20 bg-white px-5 py-2 text-sm font-semibold text-zinc-900 shadow-sm shadow-black/10 transition-all hover:border-black/400 hover:shadow-lg hover:shadow-black/15"
        >
          Add order
        </button>

        <AnimatePresence>
          {desktopFormOpen && (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
              className="mt-3 w-full min-w-[18rem] max-w-md space-y-3 rounded-xl border border-black/20 bg-white/95 p-4 shadow-lg shadow-black/10 backdrop-blur-md"
            >
              {formFields}
            </motion.form>
          )}
        </AnimatePresence>
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
  const { id, orderId, storeName, productCategory, resolutionDate } = order;
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
        {storeName && (
          <p className="text-xs text-gray-600">Store: {storeName}</p>
        )}
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
