"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { QuoteStatus, SupplierQuote } from "@/types";

interface SupplierRowProps {
  supplier: SupplierQuote;
  onPriceChange: (price: number | null) => void;
  onStatusChange: (status: QuoteStatus) => void;
  onFlag: () => void;
  onSelect: () => void;
}

export function SupplierRow({
  supplier,
  onPriceChange,
  onStatusChange,
  onFlag,
  onSelect,
}: SupplierRowProps) {
  const [priceInput, setPriceInput] = useState(
    supplier.pricePerUnit?.toString() ?? ""
  );
  const [editingPrice, setEditingPrice] = useState(false);

  useEffect(() => {
    setPriceInput(supplier.pricePerUnit?.toString() ?? "");
  }, [supplier.pricePerUnit]);

  const hasPrice =
    supplier.pricePerUnit !== null && supplier.pricePerUnit !== undefined;

  function savePrice() {
    const trimmed = priceInput.trim();
    const value = trimmed === "" ? null : Number(trimmed);
    if (trimmed !== "" && Number.isNaN(value)) return;
    onPriceChange(value);
    setEditingPrice(false);
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{supplier.supplierName}</TableCell>
      <TableCell>{supplier.contactNumber}</TableCell>
      <TableCell>
        {editingPrice ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              className="h-8 w-24"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") savePrice();
                if (e.key === "Escape") {
                  setPriceInput(supplier.pricePerUnit?.toString() ?? "");
                  setEditingPrice(false);
                }
              }}
              autoFocus
            />
            <Button type="button" size="sm" variant="ghost" onClick={savePrice}>
              Save
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className="text-left hover:text-gray-900"
            onClick={() => setEditingPrice(true)}
          >
            {hasPrice ? (
              `₹${supplier.pricePerUnit!.toLocaleString("en-IN")}`
            ) : (
              <span className="italic text-gray-400 hover:text-gray-600">
                No response — click to add
              </span>
            )}
          </button>
        )}
      </TableCell>
      <TableCell>
        <Select
          value={
            supplier.isFlagged || supplier.responseStatus === "FLAGGED"
              ? "FLAGGED"
              : supplier.responseStatus
          }
          onValueChange={(v) => v && onStatusChange(v as QuoteStatus)}
        >
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="PRICE_RECEIVED">Price received</SelectItem>
            <SelectItem value="NO_RESPONSE">No response</SelectItem>
            <SelectItem value="FLAGGED">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onFlag}
          className={cn(
            supplier.isFlagged &&
              "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-50"
          )}
        >
          {supplier.isFlagged ? "⚑ Flagged" : "Flag"}
        </Button>
      </TableCell>
      <TableCell>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrice}
          onClick={onSelect}
          className={cn(
            supplier.isSelected &&
              "border-[#3B6D11] bg-[#EAF3DE] text-[#3B6D11] hover:bg-[#EAF3DE]"
          )}
        >
          {supplier.isSelected ? "✓ Selected" : "Select"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
