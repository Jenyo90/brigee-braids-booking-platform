"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid Australian phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  referralCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function SignUpForm() {
  const searchParams = useSearchParams();
  const referralFromUrl = searchParams.get("ref") || "";
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { referralCode: referralFromUrl },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
          referral_code_used: data.referralCode || null,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 border border-[--color-gold] flex items-center justify-center mx-auto mb-6">
          <span className="text-[--color-gold] text-2xl">✓</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold mb-3">Check your email</h1>
        <p className="text-[--color-on-dark-muted] text-sm leading-relaxed mb-6">
          We&apos;ve sent a confirmation link to your email address. Click it to activate your account and start booking.
        </p>
        <Link href="/sign-in">
          <Button variant="outline">Back to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold mb-2">Create an account</h1>
        <p className="text-sm text-[--color-on-dark-muted]">
          Join to book appointments, track loyalty rewards, and receive personalised style suggestions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Full Name</label>
          <Input placeholder="Bridget Olaoluwa" {...register("fullName")} />
          {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Email Address</label>
          <Input type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Phone Number</label>
          <Input type="tel" placeholder="+61 4XX XXX XXX" autoComplete="tel" {...register("phone")} />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Password</label>
          <Input type="password" placeholder="Min. 8 characters" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {referralFromUrl && (
          <div>
            <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">
              Referral Code
            </label>
            <Input placeholder="XXXXXXXX" {...register("referralCode")} />
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-600 text-red-300 text-sm px-4 py-3">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-sm text-[--color-on-dark-muted] mt-6">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[--color-gold] hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
