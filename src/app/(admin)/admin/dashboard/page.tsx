import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatAUDFromDollars, formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react";
import type { Appointment, Payment, Profile, Style, TimeSlot } from "@/types/database";

type BookingWithJoins = Appointment & {
  profiles: Pick<Profile, "full_name" | "email"> | null;
  styles: Pick<Style, "name"> | null;
  time_slots: Pick<TimeSlot, "date" | "start_time"> | null;
};

export const metadata = { title: "Admin Dashboard" };

const STATUS_VARIANT: Record<string, "default" | "outline" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  confirmed: "default",
  completed: "success",
  cancelled: "destructive",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [r1, r2, r3, r4] = await Promise.all([
    supabase.from("appointments")
      .select("*, profiles(full_name), styles(name), time_slots(date, start_time)")
      .eq("time_slots.date", today)
      .in("status", ["pending", "confirmed"])
      .order("time_slots(start_time)"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("appointments")
      .select("*, profiles(full_name, email), styles(name), time_slots(date, start_time)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("payments")
      .select("*")
      .eq("status", "completed"),
  ]);

  const todayBookings = r1.data as BookingWithJoins[] | null;
  const totalCustomers = r2.count;
  const recentBookings = r3.data as BookingWithJoins[] | null;
  const revenueData = r4.data as Payment[] | null;

  const totalRevenue = (revenueData ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const stats = [
    { label: "Today's Bookings", value: todayBookings?.length ?? 0, icon: Calendar, href: "/admin/bookings" },
    { label: "Total Revenue", value: formatAUDFromDollars(totalRevenue), icon: DollarSign, href: "/admin/analytics" },
    { label: "Total Customers", value: totalCustomers ?? 0, icon: Users, href: "/admin/customers" },
    { label: "Pending Bookings", value: recentBookings?.filter((b) => b.status === "pending").length ?? 0, icon: TrendingUp, href: "/admin/bookings?status=pending" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
        <p className="text-[--color-on-dark-muted] text-sm mt-1">{formatDate(today)}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="border border-[--color-border] bg-[--color-surface-2] p-5 hover:border-[--color-gold] transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted]">{label}</p>
              <Icon className="h-4 w-4 text-[--color-gold]" />
            </div>
            <p className="text-2xl font-serif font-semibold group-hover:text-[--color-gold] transition-colors">
              {value}
            </p>
          </Link>
        ))}
      </div>

      {/* Today's bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-serif text-xl mb-4">Today&apos;s Schedule</h2>
          <div className="border border-[--color-border] bg-[--color-surface-2]">
            {todayBookings && todayBookings.length > 0 ? (
              todayBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="flex items-center justify-between p-4 border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-3] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{(booking.profiles as { full_name?: string })?.full_name}</p>
                    <p className="text-xs text-[--color-on-dark-muted]">{(booking.styles as { name?: string })?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[--color-gold] mb-1">
                      {formatTime((booking.time_slots as { start_time?: string })?.start_time ?? "")}
                    </p>
                    <Badge variant={STATUS_VARIANT[booking.status] ?? "secondary"}>
                      {booking.status}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="p-6 text-sm text-[--color-on-dark-muted] text-center">No appointments today</p>
            )}
          </div>
        </div>

        {/* Recent bookings */}
        <div>
          <h2 className="font-serif text-xl mb-4">Recent Bookings</h2>
          <div className="border border-[--color-border] bg-[--color-surface-2]">
            {recentBookings?.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="flex items-center justify-between p-4 border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-3] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{(booking.profiles as { full_name?: string })?.full_name}</p>
                  <p className="text-xs text-[--color-on-dark-muted]">{(booking.styles as { name?: string })?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[--color-gold] mb-1">{formatAUDFromDollars(booking.total_amount)}</p>
                  <Badge variant={STATUS_VARIANT[booking.status] ?? "secondary"}>{booking.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
