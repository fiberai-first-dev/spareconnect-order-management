"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderPeriodFilter } from "@/lib/order-flow";
import {
  PERIOD_FILTER_LABELS,
  PERIOD_FILTER_OPTIONS,
} from "@/lib/order-flow";

interface OrderStatusFilterBarProps {
  periodFilter: OrderPeriodFilter;
  onPeriodChange: (filter: OrderPeriodFilter) => void;
}

export function OrderStatusFilterBar({
  periodFilter,
  onPeriodChange,
}: OrderStatusFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="flex min-w-max items-center gap-2 pb-1 sm:min-w-0 sm:flex-wrap sm:pb-0" />
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <span className="text-sm font-medium text-gray-600">Period:</span>
        <Select
          value={periodFilter}
          onValueChange={(value) => onPeriodChange(value as OrderPeriodFilter)}
        >
          <SelectTrigger size="sm" className="w-full min-w-[8.5rem] sm:w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {PERIOD_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {PERIOD_FILTER_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
