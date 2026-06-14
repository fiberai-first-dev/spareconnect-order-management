"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { readJsonResponse, readErrorMessage } from "@/lib/api-utils";
import {
  applySequentialStatusUpdate,
  canAdvanceDelivery,
  getNextStatusActionLabel,
  getNextStatusAdvance,
} from "@/lib/order-flow";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Order } from "@/types";

const DUMMY_STORE_NAME = "Store TBD";

export type OrderCardStage = "quotation" | "confirmation" | "delivery";

const stageStyles: Record<
  OrderCardStage,
  { accent: string; hover: string; view: string }
> = {
  quotation: {
    accent: "from-zinc-600 to-black",
    hover: "hover:border-black/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
    view: "text-zinc-600",
  },
  confirmation: {
    accent: "from-neutral-500 to-zinc-800",
    hover: "hover:border-black/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]",
    view: "text-neutral-600",
  },
  delivery: {
    accent: "from-stone-500 to-black",
    hover: "hover:border-black/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)]",
    view: "text-stone-600",
  },
};

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface TogglePillProps {
  label: string;
  isDone: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function TogglePill({ label, isDone, disabled, onClick }: TogglePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Complete the previous step first" : undefined}
      className={cn(
        "rounded-full border px-3 py-2 text-xs font-medium transition-colors touch-manipulation sm:px-2.5 sm:py-1",
        disabled &&
          "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
        !disabled &&
          isDone &&
          "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800",
        !disabled &&
          !isDone &&
          "border-zinc-300 bg-zinc-50 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-100"
      )}
    >
      {label}
    </button>
  );
}

interface OrderCardProps {
  order: Order;
  stage?: OrderCardStage;
  index?: number;
  onUpdate: (order: Order) => void;
  onDelete?: (id: string) => void;
}

export function OrderCard({
  order,
  stage = "quotation",
  index = 0,
  onUpdate,
  onDelete,
}: OrderCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const quotationDone = order.quotationStatus === "COMPLETED";
  const confirmationDone = order.confirmationStatus === "CONFIRMED";
  const deliveryDone = order.deliveryStatus === "COMPLETED";
  const nextActionLabel = getNextStatusActionLabel(order);

  async function patch(update: Parameters<typeof applySequentialStatusUpdate>[1]) {
    const next = applySequentialStatusUpdate(order, update);
    if (!next) return;

    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });

    if (res.ok) {
      onUpdate(await readJsonResponse<Order>(res));
    }
  }

  async function handleQuickAdvance() {
    const advance = getNextStatusAdvance(order);
    if (!advance) return;

    setAdvancing(true);
    try {
      await patch(advance);
    } finally {
      setAdvancing(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      if (onDelete) onDelete(order.id);
      setDeleteOpen(false);
      setDetailsOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  }

  const theme = stageStyles[stage];

  return (
    <>
      <motion.button
        type="button"
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setDetailsOpen(true)}
        className={cn(
          "group relative flex w-full items-center justify-between overflow-hidden rounded-xl border border-black/20 bg-white/90 px-3 py-2.5 text-left shadow-md shadow-black/10 backdrop-blur-sm transition-shadow",
          theme.hover
        )}
      >
        <span
          className={cn(
            "absolute inset-y-0 left-0 w-1 bg-gradient-to-b",
            theme.accent
          )}
        />
        <div className="min-w-0 pl-2">
          <p className="truncate text-sm font-semibold text-gray-900">
            {order.orderNo}
          </p>
          <p className="truncate text-xs text-gray-500">{DUMMY_STORE_NAME}</p>
        </div>
        <span
          className={cn(
            "shrink-0 text-xs font-medium opacity-70 transition-opacity group-hover:opacity-100",
            theme.view
          )}
        >
          View →
        </span>
      </motion.button>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md border border-black/20 bg-white/95 shadow-xl shadow-black/15 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Order details</DialogTitle>
            <DialogDescription>
              View and update this order&apos;s status.
            </DialogDescription>
          </DialogHeader>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Order ID</dt>
              <dd className="font-medium text-gray-900">{order.orderNo}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Store name</dt>
              <dd className="font-medium text-gray-900">{DUMMY_STORE_NAME}</dd>
            </div>
            {order.productCategory && (
              <div>
                <dt className="text-gray-500">Product category</dt>
                <dd className="font-medium text-gray-900">
                  {order.productCategory}
                </dd>
              </div>
            )}
            {order.resolutionDate && (
              <div>
                <dt className="text-gray-500">Resolution date</dt>
                <dd className="font-medium text-gray-900">
                  {formatDate(order.resolutionDate)}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Entered on</dt>
              <dd className="font-medium text-gray-900">
                {formatDateTime(order.orderDate)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <TogglePill
              label={quotationDone ? "Quotation completed" : "Quotation pending"}
              isDone={quotationDone}
              onClick={() =>
                patch({
                  quotationStatus: quotationDone ? "PENDING" : "COMPLETED",
                })
              }
            />
            <TogglePill
              label={
                confirmationDone ? "Order confirmed" : "Awaiting confirmation"
              }
              isDone={confirmationDone}
              disabled={!quotationDone && !confirmationDone}
              onClick={() =>
                patch({
                  confirmationStatus: confirmationDone ? "PENDING" : "CONFIRMED",
                })
              }
            />
            <TogglePill
              label={deliveryDone ? "Delivery completed" : "Delivery pending"}
              isDone={deliveryDone}
              disabled={!canAdvanceDelivery(order) && !deliveryDone}
              onClick={() =>
                patch({
                  deliveryStatus: deliveryDone ? "PENDING" : "COMPLETED",
                })
              }
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="border border-red-600 bg-red-600 text-white shadow-sm shadow-red-500/25 hover:border-red-700 hover:bg-red-700"
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <DialogClose render={<Button variant="outline">Close</Button>} />
              {nextActionLabel && (
                <Button
                  type="button"
                  disabled={advancing}
                  onClick={handleQuickAdvance}
                >
                  {advancing ? "Updating..." : nextActionLabel}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border border-black/20 shadow-xl shadow-black/15">
          <DialogHeader>
            <DialogTitle>Delete order</DialogTitle>
            <DialogDescription>
              This action will permanently delete the order. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="border border-red-600 bg-red-600 text-white shadow-sm shadow-red-500/25 hover:border-red-700 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
