import { createClient } from "@/lib/supabase/server";
import { formatAUDFromDollars } from "@/lib/utils";
import { RevenueChart } from "./RevenueChart";
import type { Payment, LoyaltyRecord } from "@/types/database";

export const metadata = { title: "Analytics — Admin" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [
    { data: payments },
    { data: topStyles },
    { data: loyaltyDist },
    { data: monthlyRevenue },
  ] = await Promise.all([
    supabase.from("payments").select("*").eq("status", "completed"),
    supabase.from("appointments")
      .select("style_id, styles(name), status")
      .eq("status", "completed"),
    supabase.from("loyalty_records").select("*"),
    supabase.from("payments")
      .select("*")
      .eq("status", "completed")
      .gte("created_at", new Date(new Date().getFullYear(), 0, 1).toISOString()),
  ]);

  type TopStyleRow = { style_id: string; styles: { name: string } | null; status: string };

  const paymentsTyped = (payments as Payment[] | null) ?? [];
  const topStylesTyped = (topStyles as TopStyleRow[] | null) ?? [];
  const monthlyRevenueTyped = (monthlyRevenue as Payment[] | null) ?? [];
  const loyaltyDistTyped = (loyaltyDist as LoyaltyRecord[] | null) ?? [];

  const totalRevenue = paymentsTyped.reduce((s, p) => s + p.amount, 0);
  const completedCount = topStylesTyped.length;

  // Style popularity
  const styleCount: Record<string, { name: string; count: number }> = {};
  for (const a of topStylesTyped) {
    const name = a.styles?.name ?? "Unknown";
    const id = a.style_id;
    if (!styleCount[id]) styleCount[id] = { name, count: 0 };
    styleCount[id].count++;
  }
  const topStylesArr = Object.values(styleCount).sort((a, b) => b.count - a.count).slice(0, 5);

  // Tier distribution
  const tierCount: Record<string, number> = { none: 0, silver: 0, gold: 0, diamond: 0 };
  for (const r of loyaltyDistTyped) {
    tierCount[r.tier] = (tierCount[r.tier] ?? 0) + 1;
  }

  // Monthly revenue (last 6 months)
  const monthlyData: Record<string, number> = {};
  for (const p of monthlyRevenueTyped) {
    const month = new Date(p.created_at).toLocaleDateString("en-AU", { month: "short", year: "2-digit" });
    monthlyData[month] = (monthlyData[month] ?? 0) + p.amount;
  }
  const chartData = Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));

  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl font-semibold mb-8">Analytics</h1>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: formatAUDFromDollars(totalRevenue) },
          { label: "Completed Appointments", value: completedCount },
          { label: "Total Customers", value: loyaltyDistTyped.length ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="border border-[--color-border] bg-[--color-surface-2] p-5">
            <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-2">{label}</p>
            <p className="text-3xl font-serif font-semibold text-[--color-gold]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        {chartData.length > 0 && (
          <div className="border border-[--color-border] bg-[--color-surface-2] p-5 lg:col-span-2">
            <h2 className="font-serif text-xl mb-4">Monthly Revenue (AUD)</h2>
            <RevenueChart data={chartData} />
          </div>
        )}

        {/* Style popularity */}
        <div className="border border-[--color-border] bg-[--color-surface-2] p-5">
          <h2 className="font-serif text-xl mb-4">Top Styles</h2>
          <div className="space-y-3">
            {topStylesArr.map(({ name, count }) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{name}</span>
                  <span className="text-[--color-gold]">{count} bookings</span>
                </div>
                <div className="h-1.5 bg-[--color-surface-3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[--color-gold]"
                    style={{ width: `${(count / (topStylesArr[0]?.count || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {topStylesArr.length === 0 && <p className="text-sm text-[--color-on-dark-muted]">No completed appointments yet</p>}
          </div>
        </div>

        {/* Loyalty distribution */}
        <div className="border border-[--color-border] bg-[--color-surface-2] p-5">
          <h2 className="font-serif text-xl mb-4">Loyalty Tiers</h2>
          <div className="space-y-3">
            {[
              { tier: "Diamond", key: "diamond", color: "bg-cyan-400" },
              { tier: "Gold", key: "gold", color: "bg-[--color-gold]" },
              { tier: "Silver", key: "silver", color: "bg-slate-400" },
              { tier: "Member", key: "none", color: "bg-[--color-surface-3]" },
            ].map(({ tier, key, color }) => {
              const count = tierCount[key] ?? 0;
              const total = loyaltyDistTyped.length || 1;
              return (
                <div key={tier}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{tier}</span>
                    <span className="text-[--color-on-dark-muted]">{count}</span>
                  </div>
                  <div className="h-1.5 bg-[--color-surface-3] rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
