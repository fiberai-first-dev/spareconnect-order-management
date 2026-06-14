"use client";

import { useState } from "react";
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

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
      title={
        disabled ? "Complete the previous step first" : undefined
      }
      className={cn(
        "rounded-full border px-3 py-2 text-xs font-medium transition-colors touch-manipulation sm:px-2.5 sm:py-1",
        disabled &&
          "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
        !disabled &&
          isDone &&
          "border-[#3B6D11] bg-[#EAF3DE] text-[#3B6D11] hover:bg-[#dff0d0]",
        !disabled &&
          !isDone &&
          "border-[#854F0B] bg-[#FAEEDA] text-[#854F0B] hover:bg-[#f5e4c8]"
      )}
    >
      {label}
    </button>
  );
}

interface OrderCardProps {
  order: Order;
  onUpdate: (order: Order) => void;
  onDelete?: (id: string) => void;
}

export function OrderCard({ order, onUpdate, onDelete }: OrderCardProps) {
  const [advancing, setAdvancing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
      setConfirmOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gray-900 sm:text-sm">
            {order.orderNo}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Entered {formatDateTime(order.orderDate)}
          </p>
        </div>

        <div className="flex gap-2 items-center">
          {nextActionLabel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={advancing}
              onClick={handleQuickAdvance}
              className="w-full shrink-0 text-xs sm:w-auto"
            >
              {advancing ? "Updating..." : `→ ${nextActionLabel}`}
            </Button>
          )}

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="w-full shrink-0 text-xs sm:w-auto text-black bg-red-200 border-red-600 hover:bg-red-50 focus-visible:ring-red-500 "
          >
            Delete
          </Button>
        </div>
      </div>

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
    </div>
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
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
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
