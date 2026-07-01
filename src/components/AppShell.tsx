import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <MobileNav />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
