"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ProductTable,
  type ProductRow,
} from "@/components/orders/ProductTable";
import type { CreateOrderInput } from "@/types";

function createEmptyRow(): ProductRow {
  return {
    id: crypto.randomUUID(),
    productName: "",
    quantity: 1,
    priceQuoted: "",
  };
}

interface OrderEntryFormProps {
  formId: string;
  onSubmit: (data: CreateOrderInput) => Promise<void>;
}

export function OrderEntryForm({ formId, onSubmit }: OrderEntryFormProps) {
  const [shopName, setShopName] = useState("");
  const [district, setDistrict] = useState("");
  const [contact, setContact] = useState("");
  const [rows, setRows] = useState<ProductRow[]>([createEmptyRow()]);
  const [error, setError] = useState("");

  const total = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const price = row.priceQuoted === "" ? 0 : Number(row.priceQuoted);
        return sum + price * row.quantity;
      }, 0),
    [rows]
  );

  function updateRow(
    id: string,
    field: keyof ProductRow,
    value: string | number
  ) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!shopName.trim() || !district.trim() || !contact.trim()) {
      setError("Shop name, district, and contact are required.");
      return;
    }

    const validProducts = rows.filter((r) => r.productName.trim());
    if (validProducts.length === 0) {
      setError("At least one product is required.");
      return;
    }

    await onSubmit({
      shopName: shopName.trim(),
      district: district.trim(),
      contact: contact.trim(),
      products: validProducts.map((row) => ({
        productName: row.productName.trim(),
        quantity: row.quantity,
        priceQuoted: row.priceQuoted === "" ? null : Number(row.priceQuoted),
      })),
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Client details</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="shopName">Shop / client name</Label>
            <Input
              id="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact number</Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Products ordered</h2>
        <ProductTable
          rows={rows}
          onChange={updateRow}
          onRemove={(id) =>
            setRows((prev) => prev.filter((row) => row.id !== id))
          }
        />
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setRows((prev) => [...prev, createEmptyRow()])}
          >
            ＋ Add product
          </Button>
          <p className="text-sm font-medium text-gray-900">
            Total order value: ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
