import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatAUDFromDollars, formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Appointment, Style, TimeSlot } from "@/types/database";

type AppointmentWithJoins = Appointment & {
  styles: Pick<Style, "name" | "images"> | null;
  time_slots: Pick<TimeSlot, "date" | "start_time"> | null;
};

export const metadata = { title: "My Appointments" };

const STATUS_VARIANT: Record<string, "default" | "outline" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  confirmed: "default",
  completed: "success",
  cancelled: "destructive",
};

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/appointments");

  const { data: appointmentsRaw } = await supabase
    .from("appointments")
    .select("*, styles(name, images), time_slots(date, start_time)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const appointments = appointmentsRaw as AppointmentWithJoins[] | null;

  const upcoming = appointments?.filter((a) => ["pending", "confirmed"].includes(a.status)) ?? [];
  const past = appointments?.filter((a) => ["completed", "cancelled"].includes(a.status)) ?? [];

  const AppointmentCard = ({ a }: { a: AppointmentWithJoins }) => {
    const style = a.styles;
    const slot = a.time_slots;
    return (
      <div className="border border-[--color-border] bg-[--color-surface-2] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-serif text-lg font-semibold">{style?.name}</p>
            <Badge variant={STATUS_VARIANT[a.status] ?? "secondary"}>{a.status}</Badge>
            {a.is_recurring && <Badge variant="outline">Recurring</Badge>}
          </div>
          <p className="text-sm text-[--color-on-dark-muted]">
            {formatDate(slot?.date ?? "")} at {formatTime(slot?.start_time ?? "")}
          </p>
          {a.braid_length && <p className="text-xs text-[--color-on-dark-muted] mt-1">{a.braid_length} · {a.colour}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm text-[--color-gold] font-semibold">{formatAUDFromDollars(a.total_amount)}</p>
          <p className="text-xs text-[--color-on-dark-muted]">dep: {formatAUDFromDollars(a.deposit_amount)}</p>
          <p className="text-xs text-[--color-on-dark-muted] mt-1 font-mono">#{a.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl font-light">My Appointments</h1>
        <Link href="/book"><Button>Book New</Button></Link>
      </div>

      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-[--color-gold] mb-4">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((a) => <AppointmentCard key={a.id} a={a} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[--color-on-dark-muted] mb-4">Past</h2>
          <div className="space-y-3">
            {past.map((a) => <AppointmentCard key={a.id} a={a} />)}
          </div>
        </div>
      )}

      {!appointments?.length && (
        <div className="text-center py-20">
          <p className="font-serif text-2xl text-[--color-on-dark-muted] mb-4">No appointments yet</p>
          <Link href="/book"><Button>Book Your First Appointment</Button></Link>
        </div>
      )}
    </div>
  );
}
