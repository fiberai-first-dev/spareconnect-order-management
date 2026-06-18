"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, X } from "lucide-react";
import { readJsonResponse, readErrorMessage } from "@/lib/api-utils";
import {
  applySequentialStatusUpdate,
  formatDaysAgoLabel,
  getAgeBadgeTone,
  getNextStatusActionLabel,
  getNextStatusAdvance,
} from "@/lib/order-flow";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

export type OrderCardStage = "quotation" | "confirmation" | "delivery";

const stageStyles: Record<OrderCardStage, { hover: string }> = {
  quotation: {
    hover: "hover:border-black/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
  },
  confirmation: {
    hover: "hover:border-black/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]",
  },
  delivery: {
    hover: "hover:border-black/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)]",
  },
};

const ageBadgeStyles = {
  fresh: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  aging: "bg-zinc-200/80 text-zinc-700 ring-zinc-300",
  stale: "bg-amber-100 text-amber-800 ring-amber-200",
  urgent: "bg-red-100 text-red-700 ring-red-200",
} as const;

function AgeBadge({ order }: { order: Order }) {
  const tone = getAgeBadgeTone(order);
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
        ageBadgeStyles[tone]
      )}
    >
      {formatDaysAgoLabel(order)}
    </span>
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
  const [advancing, setAdvancing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const nextActionLabel = getNextStatusActionLabel(order);
  const canAdvance = getNextStatusAdvance(order) !== null;

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
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  }

  const theme = stageStyles[stage];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-black/20 bg-white/90 shadow-md shadow-black/10 backdrop-blur-sm transition-shadow",
        theme.hover
      )}
    >
      <div className="flex w-full items-center gap-1 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-semibold text-gray-900">
            {order.orderNo}
          </p>
          <AgeBadge order={order} />
        </div>

        {canAdvance && (
          <button
            type="button"
            disabled={advancing}
            onClick={() => void handleQuickAdvance()}
            aria-label={nextActionLabel ?? "Move to next stage"}
            title={nextActionLabel ?? "Move to next stage"}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors touch-manipulation hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-wait disabled:opacity-50"
          >
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </button>
        )}

        <button
          type="button"
          disabled={deleting}
          onClick={() => void handleDelete()}
          aria-label="Delete order"
          title="Delete order"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors touch-manipulation hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-50"
        >
          <X className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
}
