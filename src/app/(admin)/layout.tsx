import Link from "next/link";
import { LayoutDashboard, Calendar, Users, BookOpen, BarChart3, LogOut } from "lucide-react";
import { ToastProvider } from "@/components/ui/toast";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/catalogue", label: "Catalogue", icon: BookOpen },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-black">
        {/* Sidebar */}
        <aside className="w-56 bg-[--color-surface-2] border-r border-[--color-border] flex flex-col shrink-0">
          <div className="p-6 border-b border-[--color-border]">
            <p className="font-serif text-lg gold-text">Brigee Braids</p>
            <p className="text-xs text-[--color-on-dark-muted] mt-0.5 uppercase tracking-wider">Admin</p>
          </div>
          <nav className="flex-1 py-4">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-6 py-3 text-sm text-[--color-on-dark-muted] hover:text-[--color-gold] hover:bg-[--color-surface-3] transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-[--color-border]">
            <Link href="/api/auth/signout" className="flex items-center gap-3 px-2 py-2 text-xs text-[--color-on-dark-muted] hover:text-red-400 transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </ToastProvider>
  );
}
