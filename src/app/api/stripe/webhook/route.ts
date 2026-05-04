export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createAdminClient()) as any;

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const appointmentId = pi.metadata?.appointment_id;
    const userId = pi.metadata?.user_id;

    if (!appointmentId || !userId) {
      return NextResponse.json({ received: true });
    }

    // Update payment record
    await supabase
      .from("payments")
      .update({ status: "completed", stripe_charge_id: pi.latest_charge as string })
      .eq("stripe_payment_intent_id", pi.id);

    // Confirm appointment
    await supabase
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("id", appointmentId);

    // Get appointment + user details for notification
    const { data: appointment } = await supabase
      .from("appointments")
      .select("*, profiles(*), styles(*), time_slots(*)")
      .eq("id", appointmentId)
      .single();

    // Trigger notification (fire and forget)
    if (appointment && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          type: "confirmation",
          appointment,
        }),
      }).catch(() => {});
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    await supabase
      .from("payments")
      .update({ status: "failed" })
      .eq("stripe_payment_intent_id", pi.id);
  }

  return NextResponse.json({ received: true });
}
