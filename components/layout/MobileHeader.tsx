"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 md:hidden">
      <div className="text-sm font-semibold text-gray-900">Spare Connect</div>
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
    </header>
  );
}
