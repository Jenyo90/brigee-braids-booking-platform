import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatAUDFromDollars } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LoyaltyBadge } from "@/components/shared/LoyaltyBadge";
import type { LoyaltyTier, Profile, LoyaltyRecord } from "@/types/database";

type CustomerRow = Profile & { loyalty_records: LoyaltyRecord | LoyaltyRecord[] | null };

export const metadata = { title: "Customers — Admin" };

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: customersRaw } = await supabase
    .from("profiles")
    .select("*, loyalty_records(*)")
    .eq("role", "customer")
    .order("created_at", { ascending: false });
  const customers = customersRaw as CustomerRow[] | null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-semibold">Customers</h1>
        <p className="text-sm text-[--color-on-dark-muted]">{customers?.length ?? 0} registered</p>
      </div>

      <div className="border border-[--color-border] bg-[--color-surface-2] overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[--color-surface-3] border-b border-[--color-border]">
            <tr>
              {["Name", "Email", "Phone", "Visits", "Spent", "Tier", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[--color-on-dark-muted] font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).map((c) => {
              const loyalty = Array.isArray(c.loyalty_records) ? c.loyalty_records[0] : c.loyalty_records;
              return (
                <tr key={c.id} className="border-b border-[--color-border] hover:bg-[--color-surface-3] transition-colors">
                  <td className="px-4 py-3 font-medium">{c.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[--color-on-dark-muted]">{c.email}</td>
                  <td className="px-4 py-3 text-[--color-on-dark-muted]">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">{loyalty?.completed_appointments ?? 0}</td>
                  <td className="px-4 py-3 text-[--color-gold]">
                    {loyalty?.total_spent ? formatAUDFromDollars(loyalty.total_spent) : "$0"}
                  </td>
                  <td className="px-4 py-3">
                    {loyalty ? (
                      <LoyaltyBadge tier={loyalty.tier as LoyaltyTier} completedAppointments={loyalty.completed_appointments} />
                    ) : (
                      <Badge variant="secondary">Member</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${c.id}`} className="text-xs text-[--color-gold] hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!customers || customers.length === 0) && (
          <p className="p-8 text-center text-[--color-on-dark-muted]">No customers yet</p>
        )}
      </div>
    </div>
  );
}
