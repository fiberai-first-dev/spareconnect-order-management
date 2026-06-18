"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { appNavItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function DesktopTopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const initials = (session?.user?.name ?? "U").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-gray-200 bg-gray-50 md:block">
      <div className="flex items-center justify-between gap-6 px-6 py-3">
        <div className="flex min-w-0 items-center gap-8">
          <div className="shrink-0 text-sm font-semibold text-gray-900">
            Spare Connect
          </div>

          <nav className="flex items-center gap-1">
            {appNavItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-white font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200"
                      : "font-medium text-gray-500 hover:bg-white/70 hover:text-gray-800"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-200 text-xs font-medium text-gray-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[8rem] truncate text-xs font-medium text-gray-900">
            {session?.user?.name ?? "User"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-gray-500 hover:text-gray-900"
            title="Sign out"
            aria-label="Sign out"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
