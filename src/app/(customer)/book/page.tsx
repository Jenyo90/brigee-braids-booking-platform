import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "./BookingFlow";
import type { Style, TimeSlot } from "@/types/database";

export const metadata = { title: "Book an Appointment" };

export default async function BookPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=/book");
  }

  const [r1, r2] = await Promise.all([
    supabase.from("styles").select("*").eq("is_active", true).order("category", { ascending: true }).order("name"),
    supabase.from("time_slots").select("*").eq("is_available", true).gte("date", new Date().toISOString().split("T")[0]).order("date").order("start_time"),
  ]);
  const styles = r1.data as Style[] | null;
  const slots = r2.data as TimeSlot[] | null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-4xl font-light mb-2">
          Book Your <span className="gold-text font-semibold">Appointment</span>
        </h1>
        <p className="text-sm text-[--color-on-dark-muted]">
          Complete the steps below. A $50 deposit is required to confirm your booking.
        </p>
      </div>
      <BookingFlow styles={styles ?? []} slots={slots ?? []} userId={user.id} />
    </div>
  );
}
