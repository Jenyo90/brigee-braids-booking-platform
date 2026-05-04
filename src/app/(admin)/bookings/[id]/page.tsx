import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatAUDFromDollars, formatDate, formatTime } from "@/lib/utils";
import { BookingActions } from "./BookingActions";
import type { Appointment, Profile, Style, TimeSlot, Payment } from "@/types/database";

type BookingDetail = Appointment & {
  profiles: Profile | null;
  styles: Style | null;
  time_slots: TimeSlot | null;
  payments: Payment[] | null;
};

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: bookingRaw } = await supabase
    .from("appointments")
    .select("*, profiles(*), styles(*), time_slots(*), payments(*)")
    .eq("id", id)
    .single();
  const booking = bookingRaw as BookingDetail | null;

  if (!booking) notFound();

  const profile = booking.profiles as unknown as Record<string, string>;
  const style = booking.styles as unknown as Record<string, string | number>;
  const slot = booking.time_slots as unknown as Record<string, string>;
  const payments = booking.payments as unknown as { id: string; amount: number; type: string; status: string }[];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="font-serif text-3xl font-semibold">Booking #{id.slice(0, 8).toUpperCase()}</h1>
        <Badge variant="default">{booking.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Customer */}
        <div className="border border-[--color-border] bg-[--color-surface-2] p-5">
          <h2 className="font-serif text-lg mb-3">Customer</h2>
          <p className="font-medium">{profile?.full_name}</p>
          <p className="text-sm text-[--color-on-dark-muted]">{profile?.email}</p>
          <p className="text-sm text-[--color-on-dark-muted]">{profile?.phone}</p>
        </div>

        {/* Appointment */}
        <div className="border border-[--color-border] bg-[--color-surface-2] p-5">
          <h2 className="font-serif text-lg mb-3">Appointment</h2>
          <p className="font-medium">{style?.name as string}</p>
          <p className="text-sm text-[--color-on-dark-muted]">{formatDate(slot?.date)}</p>
          <p className="text-sm text-[--color-on-dark-muted]">{formatTime(slot?.start_time)}</p>
          {booking.is_recurring && (
            <p className="text-xs text-[--color-gold] mt-1">Recurring: {booking.recurrence_rule}</p>
          )}
        </div>

        {/* Style details */}
        <div className="border border-[--color-border] bg-[--color-surface-2] p-5">
          <h2 className="font-serif text-lg mb-3">Style Details</h2>
          {booking.braid_length && <p className="text-sm">Length: {booking.braid_length}</p>}
          {booking.colour && <p className="text-sm">Colour: {booking.colour}</p>}
          {booking.thickness && <p className="text-sm">Thickness: {booking.thickness}</p>}
          {booking.notes && <p className="text-sm text-[--color-on-dark-muted] mt-2">{booking.notes}</p>}
        </div>

        {/* Payment */}
        <div className="border border-[--color-border] bg-[--color-surface-2] p-5">
          <h2 className="font-serif text-lg mb-3">Payments</h2>
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-[--color-on-dark-muted]">Total</span>
            <span>{formatAUDFromDollars(booking.total_amount)}</span>
          </div>
          <div className="flex justify-between mb-3 text-sm">
            <span className="text-[--color-on-dark-muted]">Deposit Paid</span>
            <span className="text-[--color-gold]">{formatAUDFromDollars(booking.deposit_amount)}</span>
          </div>
          {(payments ?? []).map((p) => (
            <div key={p.id} className="text-xs text-[--color-on-dark-muted] flex justify-between">
              <span>{p.type}</span>
              <Badge variant={p.status === "completed" ? "success" : "warning"}>{p.status}</Badge>
            </div>
          ))}
        </div>
      </div>

      <BookingActions appointmentId={id} currentStatus={booking.status} stripePaymentIntentId={
        (payments ?? []).find((p) => p.type === "deposit")?.id ?? null
      } />
    </div>
  );
}
