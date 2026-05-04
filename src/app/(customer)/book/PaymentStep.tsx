"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/store/bookingStore";
import { Loader2, Lock } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ appointmentId }: { appointmentId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const setStep = useBookingStore((s) => s.setStep);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setProcessing(false);
      return;
    }

    setStep("confirm");
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { address: { country: "never" } } },
          defaultValues: { billingDetails: { address: { country: "AU" } } },
        }}
      />

      {error && (
        <div className="bg-red-950 border border-red-600 text-red-300 text-sm px-4 py-3">{error}</div>
      )}

      <Button type="submit" className="w-full gap-2" disabled={!stripe || processing}>
        {processing ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
        ) : (
          <><Lock className="h-4 w-4" /> Pay Deposit Now</>
        )}
      </Button>

      <p className="text-xs text-center text-[--color-on-dark-muted]">
        Secured by Stripe · 256-bit encryption
      </p>
    </form>
  );
}

interface PaymentStepProps {
  clientSecret: string;
  appointmentId: string;
}

export function PaymentStep({ clientSecret, appointmentId }: PaymentStepProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#C9A227",
            colorBackground: "#1A1A1A",
            colorText: "#F5F0E8",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "0px",
          },
        },
      }}
    >
      <CheckoutForm appointmentId={appointmentId} />
    </Elements>
  );
}
