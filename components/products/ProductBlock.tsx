"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SupplierTable } from "@/components/products/SupplierTable";
import { cn } from "@/lib/utils";
import type { Order, Product } from "@/types";

interface ProductBlockProps {
  order: Order;
  product: Product;
  onUpdate: () => void;
}

export function ProductBlock({ order, product, onUpdate }: ProductBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const [quotedInput, setQuotedInput] = useState(
    product.priceQuoted?.toString() ?? ""
  );

  const hasFlagged = product.suppliers.some((s) => s.isFlagged);
  const selected = product.suppliers.find((s) => s.isSelected);

  useEffect(() => {
    setQuotedInput(product.priceQuoted?.toString() ?? "");
  }, [product.priceQuoted]);

  async function patchProduct(data: Partial<Product>) {
    await fetch(`/api/orders/${order.id}/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    onUpdate();
  }

  async function saveQuotedPrice() {
    const trimmed = quotedInput.trim();
    const value = trimmed === "" ? null : Number(trimmed);
    if (trimmed !== "" && Number.isNaN(value)) {
      setQuotedInput(product.priceQuoted?.toString() ?? "");
      return;
    }
    if (value === product.priceQuoted) return;

    await patchProduct({
      priceQuoted: value,
      orderConfirmed: "MODIFIED",
    });
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-white",
        hasFlagged && "border-l-4 border-l-orange-400",
        !hasFlagged &&
          product.orderConfirmed === "CANCELLED" &&
          "border-l-4 border-l-red-400"
      )}
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <button
              type="button"
              className="font-semibold text-gray-900 hover:text-gray-700"
              onClick={() => setExpanded(!expanded)}
            >
              {product.productName}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Quoted to client (₹)</span>
              <Input
                type="number"
                min={0}
                className="h-8 w-28"
                value={quotedInput}
                onChange={(e) => setQuotedInput(e.target.value)}
                onBlur={saveQuotedPrice}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveQuotedPrice();
                  }
                  if (e.key === "Escape") {
                    setQuotedInput(product.priceQuoted?.toString() ?? "");
                  }
                }}
              />
            </div>
            {hasFlagged && (
              <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs text-orange-800">
                ⚑ Supplier follow-up
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Qty: {product.quantity}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {product.orderConfirmed === "CONFIRMED" && (
            <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-800">
              Confirmed
            </span>
          )}
          {product.orderConfirmed === "CANCELLED" && (
            <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-800">
              Cancelled
            </span>
          )}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 border-t px-4 pb-4 pt-3">
          <SupplierTable
            orderId={order.id}
            product={product}
            onUpdate={onUpdate}
          />

          {selected && product.orderConfirmed !== "CANCELLED" && (
            <div className="rounded-md bg-[#EAF3DE] px-4 py-3 text-sm text-[#3B6D11]">
              ✓ Proceeding with {selected.supplierName} at ₹
              {selected.pricePerUnit?.toLocaleString("en-IN")}/unit · Quoted ₹
              {(product.priceQuoted ?? 0).toLocaleString("en-IN")} to client
            </div>
          )}

          {product.orderConfirmed === "CONFIRMED" && (
            <div className="flex flex-wrap gap-4 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Payment</Label>
                <Select
                  value={product.paymentStatus}
                  onValueChange={(v) =>
                    v && patchProduct({ paymentStatus: v as Product["paymentStatus"] })
                  }
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="RECEIVED">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Delivery</Label>
                <Select
                  value={product.deliveryStatus}
                  onValueChange={(v) =>
                    v &&
                    patchProduct({
                      deliveryStatus: v as Product["deliveryStatus"],
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="DISPATCHED">Dispatched</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {selected && product.orderConfirmed !== "CANCELLED" && (
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  className={cn(
                    "inline-flex h-7 items-center justify-center rounded-lg border border-green-300 px-2.5 text-sm font-medium text-green-800 hover:bg-green-50"
                  )}
                  onClick={() => patchProduct({ orderConfirmed: "CONFIRMED" })}
                >
                  ✓ Confirm
                </TooltipTrigger>
                <TooltipContent side="top">
                  Mark this product as confirmed by the client. Payment and
                  delivery tracking will begin for this item.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  className={cn(
                    "inline-flex h-7 items-center justify-center rounded-lg border border-red-300 px-2.5 text-sm font-medium text-red-800 hover:bg-red-50"
                  )}
                  onClick={() => patchProduct({ orderConfirmed: "CANCELLED" })}
                >
                  ✕ Cancel
                </TooltipTrigger>
                <TooltipContent side="top">
                  Cancel this product for the client. It will be excluded from
                  order totals and no longer tracked.
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
