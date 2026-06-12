"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SupplierRow } from "@/components/products/SupplierRow";
import type { Product, QuoteStatus, SupplierQuote } from "@/types";

interface SupplierTableProps {
  orderId: string;
  product: Product;
  onUpdate: () => void;
}

export function SupplierTable({
  orderId,
  product,
  onUpdate,
}: SupplierTableProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = product.suppliers.find((s) => s.isSelected);
  const margin =
    selected && product.priceQuoted !== null
      ? product.priceQuoted - (selected.pricePerUnit ?? 0)
      : null;

  async function patchSupplier(
    supplierId: string,
    data: Partial<SupplierQuote>
  ) {
    await fetch(
      `/api/orders/${orderId}/products/${product.id}/suppliers/${supplierId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    onUpdate();
  }

  function handleStatusChange(supplier: SupplierQuote, status: QuoteStatus) {
    if (status === "FLAGGED") {
      patchSupplier(supplier.id, { isFlagged: true, responseStatus: "FLAGGED" });
      return;
    }
    patchSupplier(supplier.id, {
      isFlagged: false,
      responseStatus: status,
      ...(status === "NO_RESPONSE" ? { pricePerUnit: null } : {}),
    });
  }

  async function handleAddSupplier() {
    if (!supplierName.trim() || !contactNumber.trim()) return;
    setLoading(true);
    await fetch(`/api/orders/${orderId}/products/${product.id}/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierName: supplierName.trim(),
        contactNumber: contactNumber.trim(),
      }),
    });
    setSupplierName("");
    setContactNumber("");
    setShowAddForm(false);
    setLoading(false);
    onUpdate();
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Price / unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead>Select</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {product.suppliers.map((supplier) => (
              <SupplierRow
                key={supplier.id}
                supplier={supplier}
                onPriceChange={(price) =>
                  patchSupplier(supplier.id, { pricePerUnit: price })
                }
                onStatusChange={(status) =>
                  handleStatusChange(supplier, status)
                }
                onFlag={() =>
                  patchSupplier(supplier.id, {
                    isFlagged: !supplier.isFlagged,
                  })
                }
                onSelect={() => patchSupplier(supplier.id, { isSelected: true })}
              />
            ))}
            {showAddForm && (
              <TableRow>
                <TableCell>
                  <Input
                    placeholder="Supplier name"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Contact number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </TableCell>
                <TableCell colSpan={3} />
                <TableCell>
                  <Button
                    size="sm"
                    onClick={handleAddSupplier}
                    disabled={loading}
                  >
                    Save
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
        >
          ＋ Add supplier
        </Button>
        {selected && margin !== null && (
          <span className="text-sm text-gray-600">
            Margin: ₹{margin.toLocaleString("en-IN")}/unit
          </span>
        )}
      </div>
    </div>
  );
}
