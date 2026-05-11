import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatAUDFromDollars, formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/types/database";

type BookingRow = Appointment & {
  profiles: { full_name: string | null; email: string | null; phone: string | null } | null;
  styles: { name: string } | null;
  time_slots: { date: string; start_time: string } | null;
};

interface BookingsPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const STATUS_VARIANT: Record<string, "default" | "outline" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  confirmed: "default",
  completed: "success",
  cancelled: "destructive",
};

export const metadata = { title: "Bookings — Admin" };

export default async function AdminBookingsPage({ searchParams }: BookingsPageProps) {
  const { status, page } = await searchParams;
  const pageNum = parseInt(page ?? "1");
  const PAGE_SIZE = 20;
  const offset = (pageNum - 1) * PAGE_SIZE;

  const supabase = await createClient();

  let query = supabase
    .from("appointments")
    .select("*, profiles(full_name, email, phone), styles(name), time_slots(date, start_time)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (status) query = query.eq("status", status);

  const { data: bookingsRaw, count } = await query;
  const bookings = bookingsRaw as BookingRow[] | null;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-semibold">Bookings</h1>
        <p className="text-sm text-[--color-on-dark-muted]">{count} total</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <Link key={s} href={s === "all" ? "/admin/bookings" : `/admin/bookings?status=${s}`}>
            <Badge
              variant={(!status && s === "all") || status === s ? "default" : "outline"}
              className="cursor-pointer capitalize"
            >
              {s}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[--color-border] bg-[--color-surface-2] overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[--color-surface-3] border-b border-[--color-border]">
            <tr>
              {["ID", "Customer", "Style", "Date", "Amount", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[--color-on-dark-muted] font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(bookings ?? []).map((b) => (
              <tr key={b.id} className="border-b border-[--color-border] hover:bg-[--color-surface-3] transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-[--color-on-dark-muted]">{b.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{b.profiles?.full_name}</p>
                  <p className="text-xs text-[--color-on-dark-muted]">{b.profiles?.email}</p>
                </td>
                <td className="px-4 py-3">{b.styles?.name}</td>
                <td className="px-4 py-3">
                  <p>{formatDate(b.time_slots?.date ?? "")}</p>
                  <p className="text-xs text-[--color-on-dark-muted]">{formatTime(b.time_slots?.start_time ?? "")}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[--color-gold]">{formatAUDFromDollars(b.total_amount)}</p>
                  <p className="text-xs text-[--color-on-dark-muted]">dep: {formatAUDFromDollars(b.deposit_amount)}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{b.status}</Badge>
                  {b.is_recurring && <Badge variant="outline" className="ml-1">Recurring</Badge>}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/bookings/${b.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!bookings || bookings.length === 0) && (
          <p className="p-8 text-center text-[--color-on-dark-muted]">No bookings found</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/admin/bookings?${status ? `status=${status}&` : ""}page=${p}`}>
              <Button variant={p === pageNum ? "default" : "outline"} size="sm">{p}</Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
