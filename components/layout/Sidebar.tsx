"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/orders", label: "⬤ Order status" },
  { href: "/history", label: "◷ Order history" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const initials = (session?.user?.name ?? "U").slice(0, 2).toUpperCase();

  return (
    <aside className="hidden w-[172px] shrink-0 flex-col self-stretch border-r border-gray-200 bg-gray-50 md:flex">
      <div className="px-4 py-5">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold leading-tight text-gray-900">
            Spare
            <br />
            Connect
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-gray-500 hover:text-gray-900"
            title="Sign out"
            aria-label="Sign out"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
        <Separator className="mt-4" />
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md border-l-2 px-3 py-2 text-sm transition-colors",
                active
                  ? "border-gray-900 bg-white font-semibold text-gray-900"
                  : "border-transparent font-normal text-gray-500 hover:bg-white/70 hover:text-gray-800"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-200 text-xs font-medium text-gray-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-gray-900">
              {session?.user?.name ?? "User"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
