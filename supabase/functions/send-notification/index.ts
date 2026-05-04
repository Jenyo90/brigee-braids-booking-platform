import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")!;
const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") ?? "hello@brigeebraids.com.au";

type NotificationType = "confirmation" | "reminder_48h" | "reminder_12h" | "cancellation" | "feedback";

interface AppointmentData {
  id: string;
  status: string;
  total_amount: number;
  deposit_amount: number;
  profiles: { full_name: string; email: string; phone: string };
  styles: { name: string };
  time_slots: { date: string; start_time: string };
}

function formatAUD(amount: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);
}

function formatDateTime(date: string, time: string) {
  const dt = new Date(`${date}T${time}+10:00`);
  return dt.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Australia/Sydney" });
}

function buildSMS(type: NotificationType, appt: AppointmentData): string {
  const name = appt.profiles.full_name?.split(" ")[0] ?? "there";
  const when = formatDateTime(appt.time_slots.date, appt.time_slots.start_time);

  switch (type) {
    case "confirmation":
      return `Hi ${name}! Your Brigee Braids booking for ${appt.styles.name} on ${when} is confirmed. Deposit paid: ${formatAUD(appt.deposit_amount)}. See you soon! 💛`;
    case "reminder_48h":
      return `Hi ${name}! Reminder: your Brigee Braids appointment for ${appt.styles.name} is in 48 hours — ${when}. To reschedule, contact us at least 24hrs before. ✨`;
    case "reminder_12h":
      return `Hi ${name}! Your Brigee Braids appointment is tomorrow: ${appt.styles.name} at ${when}. We can't wait to see you! 💛`;
    case "cancellation":
      return `Hi ${name}, your Brigee Braids appointment for ${appt.styles.name} on ${when} has been cancelled. Contact us to rebook.`;
    case "feedback":
      return `Hi ${name}! Thank you for visiting Brigee Braids. We'd love your feedback — book your next appointment at brigeebraids.com.au 💛`;
  }
}

function buildEmail(type: NotificationType, appt: AppointmentData): { subject: string; html: string } {
  const name = appt.profiles.full_name?.split(" ")[0] ?? "there";
  const when = formatDateTime(appt.time_slots.date, appt.time_slots.start_time);

  const baseHtml = (title: string, body: string) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#0F0F0F;font-family:Georgia,serif;color:#F5F0E8;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr><td style="padding:0 0 24px;border-bottom:1px solid #C9A227">
              <h1 style="margin:0;font-size:24px;font-weight:400;color:#C9A227;letter-spacing:2px">BRIGEE BRAIDS</h1>
            </td></tr>
            <tr><td style="padding:32px 0">
              <h2 style="font-size:22px;font-weight:400;margin:0 0 16px">${title}</h2>
              <p style="font-size:15px;line-height:1.7;color:#A89F94;margin:0 0 24px">Hi ${name},</p>
              ${body}
            </td></tr>
            <tr><td style="padding:24px 0;border-top:1px solid #2E2E2E">
              <p style="font-size:12px;color:#A89F94;margin:0">Brigee Braids · Gosford, NSW 2250<br>
              <a href="mailto:hello@brigeebraids.com.au" style="color:#C9A227">hello@brigeebraids.com.au</a></p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

  switch (type) {
    case "confirmation":
      return {
        subject: `Booking Confirmed — ${appt.styles.name}`,
        html: baseHtml("Your Booking is Confirmed ✓", `
          <p style="font-size:15px;line-height:1.7;color:#A89F94;margin:0 0 20px">Your appointment has been confirmed. Here are the details:</p>
          <table width="100%" style="border:1px solid #2E2E2E;margin-bottom:24px">
            <tr><td style="padding:12px;border-bottom:1px solid #2E2E2E;font-size:13px;color:#A89F94">Style</td><td style="padding:12px;border-bottom:1px solid #2E2E2E;font-size:13px">${appt.styles.name}</td></tr>
            <tr><td style="padding:12px;border-bottom:1px solid #2E2E2E;font-size:13px;color:#A89F94">Date & Time</td><td style="padding:12px;border-bottom:1px solid #2E2E2E;font-size:13px">${when}</td></tr>
            <tr><td style="padding:12px;border-bottom:1px solid #2E2E2E;font-size:13px;color:#A89F94">Deposit Paid</td><td style="padding:12px;border-bottom:1px solid #2E2E2E;font-size:13px;color:#C9A227">${formatAUD(appt.deposit_amount)}</td></tr>
            <tr><td style="padding:12px;font-size:13px;color:#A89F94">Balance Due</td><td style="padding:12px;font-size:13px">${formatAUD(appt.total_amount - appt.deposit_amount)}</td></tr>
          </table>
          <p style="font-size:13px;color:#A89F94;line-height:1.7">Please note our <strong style="color:#F5F0E8">24-hour cancellation policy</strong>. Late cancellations or no-shows may result in forfeiture of your deposit.</p>
        `),
      };
    case "reminder_48h":
      return { subject: `Reminder: Your appointment is in 2 days`, html: baseHtml("Appointment Reminder", `<p style="font-size:15px;line-height:1.7;color:#A89F94">Your ${appt.styles.name} appointment is coming up on <strong style="color:#F5F0E8">${when}</strong>. We&apos;re looking forward to seeing you!</p><p style="font-size:13px;color:#A89F94">Need to reschedule? Please contact us at least 24 hours before your appointment.</p>`) };
    case "reminder_12h":
      return { subject: `See you tomorrow! Your braids appointment`, html: baseHtml("See You Tomorrow!", `<p style="font-size:15px;line-height:1.7;color:#A89F94">Just a reminder that your <strong style="color:#F5F0E8">${appt.styles.name}</strong> appointment is <strong style="color:#C9A227">tomorrow at ${when}</strong>. We can't wait!</p>`) };
    case "cancellation":
      return { subject: `Appointment Cancelled`, html: baseHtml("Appointment Cancelled", `<p style="font-size:15px;line-height:1.7;color:#A89F94">Your ${appt.styles.name} appointment on ${when} has been cancelled. If this was unexpected, please contact us to rebook.</p>`) };
    case "feedback":
      return { subject: `How was your experience at Brigee Braids?`, html: baseHtml("Thank You for Visiting!", `<p style="font-size:15px;line-height:1.7;color:#A89F94">We hope you love your new braids! Your feedback helps us improve. Ready to book your next appointment?</p><a href="https://brigeebraids.com.au/book" style="display:inline-block;background:#C9A227;color:#000;padding:12px 24px;text-decoration:none;font-size:13px;letter-spacing:1px;margin-top:16px">BOOK AGAIN</a>`) };
  }
}

async function sendSMS(to: string, message: string): Promise<boolean> {
  const formData = new URLSearchParams({ From: TWILIO_PHONE_NUMBER, To: to, Body: message });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });
  return res.ok;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: SENDGRID_FROM_EMAIL, name: "Brigee Braids" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });
  return res.ok;
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { type, appointment } = await req.json() as { type: NotificationType; appointment: AppointmentData };

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const smsText = buildSMS(type, appointment);
    const { subject, html } = buildEmail(type, appointment);

    const [smsOk, emailOk] = await Promise.all([
      appointment.profiles.phone ? sendSMS(appointment.profiles.phone, smsText) : Promise.resolve(false),
      appointment.profiles.email ? sendEmail(appointment.profiles.email, subject, html) : Promise.resolve(false),
    ]);

    // Log notifications
    const logs = [];
    if (appointment.profiles.phone) {
      logs.push({ user_id: appointment.profiles ? (appointment as AppointmentData & { user_id?: string }).user_id : undefined, appointment_id: appointment.id, type, channel: "sms", status: smsOk ? "sent" : "failed", sent_at: new Date().toISOString() });
    }
    if (appointment.profiles.email) {
      logs.push({ appointment_id: appointment.id, type, channel: "email", status: emailOk ? "sent" : "failed", sent_at: new Date().toISOString() });
    }

    return new Response(JSON.stringify({ smsOk, emailOk }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
