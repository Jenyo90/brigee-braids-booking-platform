"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import type { AppointmentStatus } from "@/types/database";

interface BookingActionsProps {
  appointmentId: string;
  currentStatus: AppointmentStatus;
  stripePaymentIntentId: string | null;
}

export function BookingActions({ appointmentId, currentStatus, stripePaymentIntentId }: BookingActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const updateStatus = async (status: AppointmentStatus) => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Booking status set to ${status}`, variant: "success" });
      router.refresh();
    }
    setLoading(false);
  };

  const handleRefund = async () => {
    if (!confirm("Issue a full refund on the deposit? This cannot be undone.")) return;
    setLoading(true);

    const res = await fetch("/api/stripe/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, stripePaymentIntentId }),
    });

    if (res.ok) {
      toast({ title: "Refund issued", description: "Deposit has been refunded to the customer.", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Refund failed", description: "Please check Stripe dashboard.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="border border-[--color-border] bg-[--color-surface-2] p-5">
      <h2 className="font-serif text-lg mb-4">Actions</h2>
      <div className="flex flex-wrap gap-3">
        {currentStatus === "pending" && (
          <Button onClick={() => updateStatus("confirmed")} disabled={loading}>
            Confirm Booking
          </Button>
        )}
        {(currentStatus === "pending" || currentStatus === "confirmed") && (
          <Button variant="destructive" onClick={() => updateStatus("cancelled")} disabled={loading}>
            Cancel Booking
          </Button>
        )}
        {currentStatus === "confirmed" && (
          <Button variant="secondary" onClick={() => updateStatus("completed")} disabled={loading}>
            Mark Completed
          </Button>
        )}
        {(currentStatus === "cancelled" || currentStatus === "completed") && stripePaymentIntentId && (
          <Button variant="outline" onClick={handleRefund} disabled={loading}>
            Issue Refund
          </Button>
        )}
      </div>
    </div>
  );
}
