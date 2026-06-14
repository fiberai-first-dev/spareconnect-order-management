import { cn } from "@/lib/utils";
import type { OrderStageCounts, OrderStageFilter } from "@/lib/order-flow";

const STAGE_KEYS: Array<{
  key: Exclude<OrderStageFilter, "all">;
  label: string;
  countKey: keyof OrderStageCounts;
  dotColor: string;
}> = [
  {
    key: "quotation",
    label: "Orders",
    countKey: "quotationPending",
    dotColor: "bg-[#E5A017]",
  },
  {
    key: "confirmation",
    label: "Awaiting confirmation",
    countKey: "confirmationPending",
    dotColor: "bg-[#E5A017]",
  },
  {
    key: "delivery",
    label: "Delivery pending",
    countKey: "deliveryPending",
    dotColor: "bg-[#3B6D11]",
  },
];

interface SummaryCardProps {
  label: string;
  count: number;
  dotColor: string;
  active: boolean;
  onClick: () => void;
}

function SummaryCard({
  label,
  count,
  dotColor,
  active,
  onClick,
}: SummaryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-[7rem] flex-col justify-between rounded-lg border bg-white px-4 py-3 text-left transition-colors touch-manipulation",
        active
          ? "border-gray-900 ring-2 ring-gray-900/10"
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)}
          aria-hidden
        />
        <p className="text-xs font-medium text-gray-600">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-gray-900">
        {count}
      </p>
    </button>
  );
}

interface OrderStatusSummaryProps {
  counts: OrderStageCounts;
  activeFilter: OrderStageFilter;
  onFilterChange: (filter: OrderStageFilter) => void;
}

export function OrderStatusSummary({
  counts,
  activeFilter,
  onFilterChange,
}: OrderStatusSummaryProps) {
  const cards = STAGE_KEYS.map(({ key, label, countKey, dotColor }) => (
    <SummaryCard
      key={key}
      label={label}
      count={counts[countKey]}
      dotColor={dotColor}
      active={activeFilter === key}
      onClick={() => onFilterChange(activeFilter === key ? "all" : key)}
    />
  ));

  return (
    <>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory md:hidden">
        {STAGE_KEYS.map(({ key, label, countKey, dotColor }) => (
          <div key={key} className="min-w-[9.5rem] shrink-0 snap-start">
            <SummaryCard
              label={label}
              count={counts[countKey]}
              dotColor={dotColor}
              active={activeFilter === key}
              onClick={() =>
                onFilterChange(activeFilter === key ? "all" : key)
              }
            />
          </div>
        ))}
      </div>

      <div className="hidden gap-3 md:grid md:grid-cols-3">{cards}</div>
    </>
  );
}
