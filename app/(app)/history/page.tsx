"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "@/types";

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function HistoryCard({ order }: { order: Order }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-gray-900">{order.orderNo}</h3>
        <span className="shrink-0 rounded-full bg-[#EAF3DE] px-2 py-0.5 text-xs font-medium text-[#3B6D11]">
          Delivered
        </span>
      </div>
      <p className="mb-3 text-xs text-gray-500">
        Entered {formatDateTime(order.orderDate)}
      </p>
      <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
        <div>
          <p className="text-gray-500">Quotation</p>
          <p className="font-medium text-gray-900">
            {statusLabel(order.quotationStatus)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Order</p>
          <p className="font-medium text-gray-900">
            {statusLabel(order.confirmationStatus)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Delivery</p>
          <p className="font-medium text-gray-900">
            {statusLabel(order.deliveryStatus)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      orders.filter((o) =>
        o.orderNo.toLowerCase().includes(search.toLowerCase())
      ),
    [orders, search]
  );

  return (
    <div className="px-4 py-4 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg font-semibold text-gray-900 md:text-xl">
          Order history
        </h1>
        <Input
          placeholder="Search by order no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-56"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading history...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No orders found.</p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((order) => (
              <HistoryCard key={order.id} order={order} />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order no.</TableHead>
                  <TableHead>Entered</TableHead>
                  <TableHead>Quotation</TableHead>
                  <TableHead>Order status</TableHead>
                  <TableHead>Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNo}
                    </TableCell>
                    <TableCell>{formatDateTime(order.orderDate)}</TableCell>
                    <TableCell>{statusLabel(order.quotationStatus)}</TableCell>
                    <TableCell>
                      {statusLabel(order.confirmationStatus)}
                    </TableCell>
                    <TableCell>{statusLabel(order.deliveryStatus)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
