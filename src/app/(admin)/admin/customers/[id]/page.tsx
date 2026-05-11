import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { LoyaltyBadge } from "@/components/shared/LoyaltyBadge";
import { formatAUDFromDollars, formatDate, formatTime } from "@/lib/utils";
import type { Profile, LoyaltyRecord, Appointment, Style, TimeSlot, LoyaltyTier } from "@/types/database";

type CustomerDetail = Profile & {
  loyalty_records: LoyaltyRecord | null;
  appointments: (Appointment & {
    styles: Style | null;
    time_slots: TimeSlot | null;
  })[];
};

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_VARIANT: Record<string, "default" | "outline" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  confirmed: "default",
  completed: "success",
  cancelled: "destructive",
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: raw } = await supabase
    .from("profiles")
    .select("*, loyalty_records(*), appointments(*, styles(*), time_slots(*))")
    .eq("id", id)
    .eq("role", "customer")
    .single();

  if (!raw) notFound();

  const customer = raw as unknown as CustomerDetail;
  const loyalty = Array.isArray(customer.loyalty_records)
    ? customer.loyalty_records[0]
    : customer.loyalty_records;
  const appointments = (customer.appointments ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/customers" className="text-xs text-[--color-on-dark-muted] hover:text-[--color-on-dark]">
          ← Customers
        </Link>
      </div>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="font-serif text-3xl font-semibold">{customer.full_name ?? "Unnamed Customer"}</h1>
        {loyalty && (
          <LoyaltyBadge tier={loyalty.tier as LoyaltyTier} completedAppointments={loyalty.completed_appointments} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Contact */}
        <div className="border border-[--color-border] bg-[--color-surface-2] p-5">
          <h2 className="font-serif text-lg mb-3">Contact</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[--color-on-dark-muted]">Email</dt>
              <dd>{customer.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[--color-on-dark-muted]">Phone</dt>
              <dd>{customer.phone ?? "—"}</dd>
            </div>
            {customer.instagram && (
              <div className="flex justify-between">
                <dt className="text-[--color-on-dark-muted]">Instagram</dt>
                <dd>@{customer.instagram}</dd>
              </div>
            )}
            {customer.facebook && (
              <div className="flex justify-between">
                <dt className="text-[--color-on-dark-muted]">Facebook</dt>
                <dd>{customer.facebook}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-[--color-on-dark-muted]">Member since</dt>
              <dd>{formatDate(customer.created_at)}</dd>
            </div>
          </dl>
        </div>

        {/* Loyalty */}
        <div className="border border-[--color-border] bg-[--color-surface-2] p-5">
          <h2 className="font-serif text-lg mb-3">Loyalty</h2>
          {loyalty ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[--color-on-dark-muted]">Tier</dt>
                <dd className="capitalize">{loyalty.tier}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[--color-on-dark-muted]">Completed visits</dt>
                <dd>{loyalty.completed_appointments}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[--color-on-dark-muted]">Total spent</dt>
                <dd>{formatAUDFromDollars(loyalty.total_spent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[--color-on-dark-muted]">Points</dt>
                <dd>{loyalty.points}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-[--color-on-dark-muted]">No loyalty record yet</p>
          )}
        </div>

        {/* Hair profile */}
        {(customer.hair_length || customer.hair_texture || customer.hair_history) && (
          <div className="border border-[--color-border] bg-[--color-surface-2] p-5">
            <h2 className="font-serif text-lg mb-3">Hair Profile</h2>
            <dl className="space-y-2 text-sm">
              {customer.hair_length && (
                <div className="flex justify-between">
                  <dt className="text-[--color-on-dark-muted]">Length</dt>
                  <dd>{customer.hair_length}</dd>
                </div>
              )}
              {customer.hair_texture && (
                <div className="flex justify-between">
                  <dt className="text-[--color-on-dark-muted]">Texture</dt>
                  <dd>{customer.hair_texture}</dd>
                </div>
              )}
              {customer.hair_history && (
                <div className="flex justify-between">
                  <dt className="text-[--color-on-dark-muted]">History</dt>
                  <dd className="text-right max-w-[60%]">{customer.hair_history}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Referral */}
        <div className="border border-[--color-border] bg-[--color-surface-2] p-5">
          <h2 className="font-serif text-lg mb-3">Referral</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[--color-on-dark-muted]">Referral code</dt>
              <dd className="font-mono">{customer.referral_code ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[--color-on-dark-muted]">Referred by</dt>
              <dd className="font-mono">{customer.referred_by ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Appointment history */}
      <div>
        <h2 className="font-serif text-xl mb-4">Appointment History ({appointments.length})</h2>
        <div className="border border-[--color-border] bg-[--color-surface-2] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[--color-surface-3] border-b border-[--color-border]">
              <tr>
                {["ID", "Style", "Date", "Amount", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[--color-on-dark-muted] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-[--color-border] hover:bg-[--color-surface-3] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[--color-on-dark-muted]">{a.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">{a.styles?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <p>{formatDate(a.time_slots?.date ?? "")}</p>
                    <p className="text-xs text-[--color-on-dark-muted]">{formatTime(a.time_slots?.start_time ?? "")}</p>
                  </td>
                  <td className="px-4 py-3">{formatAUDFromDollars(a.total_amount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[a.status] ?? "secondary"}>{a.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/bookings/${a.id}`} className="text-xs text-[--color-gold] hover:underline">
                      View booking
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <p className="p-8 text-center text-[--color-on-dark-muted]">No appointments yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
