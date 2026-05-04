export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import type { Payment } from "@/types/database";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profile = user ? await createAdminClient().then(async (c) => {
    const { data } = await c.from("profiles").select("role").eq("id", user.id).single();
    return data as { role: string } | null;
  }) : null;

  if (!user || profile?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appointmentId, stripePaymentIntentId } = await request.json();
  const adminSupabase = await createAdminClient();

  try {
    // Get payment record
    const { data: paymentRaw } = await adminSupabase
      .from("payments")
      .select("*")
      .eq("appointment_id", appointmentId)
      .eq("type", "deposit")
      .single();
    const payment = paymentRaw as Payment | null;

    if (!payment?.stripe_payment_intent_id) {
      return NextResponse.json({ error: "No payment found" }, { status: 404 });
    }

    // Retrieve payment intent to get charge ID
    const pi = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id);
    const chargeId = pi.latest_charge as string;

    if (!chargeId) {
      return NextResponse.json({ error: "No charge found" }, { status: 404 });
    }

    // Issue refund
    await stripe.refunds.create({ charge: chargeId });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = adminSupabase as any;
    // Update records
    await Promise.all([
      db.from("payments")
        .update({ status: "refunded" })
        .eq("id", payment.id),
      db.from("payments")
        .insert({
          appointment_id: appointmentId,
          user_id: payment.user_id,
          amount: payment.amount,
          currency: "aud",
          type: "refund",
          payment_method: "stripe",
          status: "completed",
        }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}
