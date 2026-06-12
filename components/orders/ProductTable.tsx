"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ProductRow {
  id: string;
  productName: string;
  quantity: number;
  priceQuoted: number | "";
}

interface ProductTableProps {
  rows: ProductRow[];
  onChange: (id: string, field: keyof ProductRow, value: string | number) => void;
  onRemove: (id: string) => void;
}

export function ProductTable({ rows, onChange, onRemove }: ProductTableProps) {
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div
          key={row.id}
          className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Product {index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-gray-400 hover:text-red-600"
              onClick={() => onRemove(row.id)}
              disabled={rows.length === 1}
              aria-label="Remove product"
            >
              ×
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor={`product-${row.id}`}>Product</Label>
              <Input
                id={`product-${row.id}`}
                value={row.productName}
                onChange={(e) =>
                  onChange(row.id, "productName", e.target.value)
                }
                placeholder="Product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`qty-${row.id}`}>Qty</Label>
              <Input
                id={`qty-${row.id}`}
                type="number"
                min={1}
                value={row.quantity}
                onChange={(e) =>
                  onChange(row.id, "quantity", Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`price-${row.id}`}>Price quoted (₹)</Label>
              <Input
                id={`price-${row.id}`}
                type="number"
                min={0}
                value={row.priceQuoted}
                onChange={(e) =>
                  onChange(
                    row.id,
                    "priceQuoted",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="0"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
