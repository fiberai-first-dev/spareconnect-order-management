"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/orders", label: "Order status" },
  { href: "/history", label: "Order history" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center px-2 py-3 text-xs font-medium transition-colors",
                active
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              <span
                className={cn(
                  "mb-1 h-1 w-8 rounded-full",
                  active ? "bg-gray-900" : "bg-transparent"
                )}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
