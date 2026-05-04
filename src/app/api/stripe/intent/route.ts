export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type { Appointment } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      styleId, slotId, braid_length, colour, thickness, notes,
      inspiration_photos, ai_suggestion, total_amount, deposit_amount,
      is_recurring, recurrence_rule, userId,
    } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createAdminClient()) as any;

    // Create the appointment record
    const { data: appointmentRaw, error: apptError } = await supabase
      .from("appointments")
      .insert({
        user_id: userId,
        style_id: styleId,
        slot_id: slotId,
        braid_length,
        colour,
        thickness,
        notes,
        inspiration_photos: inspiration_photos ?? [],
        ai_suggestion,
        total_amount,
        deposit_amount,
        is_recurring: is_recurring ?? false,
        recurrence_rule: recurrence_rule ?? null,
        status: "pending",
      })
      .select()
      .single();
    const appointment = appointmentRaw as Appointment | null;

    if (apptError || !appointment) {
      return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
    }

    // Get user email for Stripe
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    // Create Stripe PaymentIntent for deposit amount (in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(deposit_amount * 100),
      currency: "aud",
      metadata: {
        appointment_id: appointment.id,
        user_id: userId,
        type: "deposit",
      },
      receipt_email: profile?.email ?? undefined,
      description: `Brigee Braids deposit — appointment ${appointment.id.slice(0, 8).toUpperCase()}`,
    });

    // Create pending payment record
    await supabase.from("payments").insert({
      appointment_id: appointment.id,
      user_id: userId,
      amount: deposit_amount,
      currency: "aud",
      type: "deposit",
      payment_method: "stripe",
      stripe_payment_intent_id: paymentIntent.id,
      status: "pending",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      appointmentId: appointment.id,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
