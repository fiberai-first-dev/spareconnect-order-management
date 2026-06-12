import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { DemoBanner } from "@/components/layout/DemoBanner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const isDemoMode = !process.env.DATABASE_URL;

  return (
    <div className="flex min-h-screen flex-col">
      {isDemoMode && <DemoBanner />}
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MobileHeader />
          <main className="min-h-0 flex-1 overflow-auto bg-white pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            {children}
          </main>
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
