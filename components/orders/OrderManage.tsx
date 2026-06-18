import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type NewOrderInput = {
  orderId: string;
};

type AddOrderFormProps = {
  onAdd: (order: NewOrderInput) => Promise<void> | void;
  existingOrderNos: string[];
};

export function AddOrderForm({ onAdd, existingOrderNos }: AddOrderFormProps) {
  const [orderId, setOrderId] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const isDuplicateOrderId = (value: string) =>
    existingOrderNos.some(
      (existing) => existing.trim().toLowerCase() === value.trim().toLowerCase()
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedOrderId = orderId.trim();

    if (!trimmedOrderId) {
      return;
    }

    if (isDuplicateOrderId(trimmedOrderId)) {
      setFormError("This order ID already exists.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      await onAdd({ orderId: trimmedOrderId });
      setOrderId("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to add order."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="mb-3 shrink-0 space-y-2"
    >
      <div className="flex gap-2">
        <Input
          value={orderId}
          onChange={(e) => {
            setOrderId(e.target.value);
            if (formError) setFormError("");
          }}
          placeholder="Order ID"
          inputMode="numeric"
          className="h-9 flex-1 bg-white/80 text-sm"
          disabled={saving}
        />
        <Button type="submit" size="sm" disabled={saving || !orderId.trim()}>
          {saving ? "Adding..." : "Add"}
        </Button>
      </div>
      {formError && (
        <p className="text-xs font-medium text-red-600">{formError}</p>
      )}
    </form>
  );
}
