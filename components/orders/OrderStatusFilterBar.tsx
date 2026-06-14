"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { OrderPeriodFilter, OrderStageCounts, OrderStageFilter } from "@/lib/order-flow";
import {
  PERIOD_FILTER_LABELS,
  PERIOD_FILTER_OPTIONS,
  STAGE_FILTER_LABELS,
} from "@/lib/order-flow";

const FILTER_OPTIONS: Array<{
  key: OrderStageFilter;
  countKey?: keyof OrderStageCounts;
}> = [
  { key: "all" },
  { key: "quotation", countKey: "quotationPending" },
  { key: "confirmation", countKey: "confirmationPending" },
  { key: "delivery", countKey: "deliveryPending" },
];

interface OrderStatusFilterBarProps {
  counts: OrderStageCounts;
  activeFilter: OrderStageFilter;
  onFilterChange: (filter: OrderStageFilter) => void;
  periodFilter: OrderPeriodFilter;
  onPeriodChange: (filter: OrderPeriodFilter) => void;
}

export function OrderStatusFilterBar({
  counts,
  activeFilter,
  onFilterChange,
  periodFilter,
  onPeriodChange,
}: OrderStatusFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="flex min-w-max items-center gap-2 pb-1 sm:min-w-0 sm:flex-wrap sm:pb-0">
          
          

            
        </div>
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
