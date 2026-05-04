"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({ email: z.string().email("Enter a valid email") });

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="font-serif text-3xl font-semibold mb-3">Check your email</h1>
        <p className="text-[--color-on-dark-muted] text-sm mb-6">
          If an account exists with that email, we&apos;ve sent a password reset link.
        </p>
        <Link href="/sign-in"><Button variant="outline">Back to Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold mb-2">Reset password</h1>
        <p className="text-sm text-[--color-on-dark-muted]">Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Email Address</label>
          <Input type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send Reset Link"}
        </Button>
      </form>

      <p className="text-center text-sm text-[--color-on-dark-muted] mt-6">
        Remembered it?{" "}
        <Link href="/sign-in" className="text-[--color-gold] hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
