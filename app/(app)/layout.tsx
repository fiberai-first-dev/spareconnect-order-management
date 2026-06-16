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
      <div className="flex flex-1 items-stretch">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader />
          <main className="orders-page-bg flex-1 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            {children}
          </main>
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
