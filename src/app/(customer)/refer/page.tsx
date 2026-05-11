import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReferPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function ReferPage({ searchParams }: ReferPageProps) {
  const { code } = await searchParams;

  if (!code) redirect("/sign-up");

  const supabase = await createClient();
  const { data: referrerRaw } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("referral_code", code)
    .single();
  const referrer = referrerRaw as { full_name: string | null } | null;

  return (
    <div className="min-h-screen bg-[--color-surface] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Badge variant="outline" className="mb-6">Referral Invite</Badge>
        <h1 className="font-serif text-4xl font-light mb-4">
          {referrer?.full_name ? (
            <>You&apos;ve been invited by <span className="gold-text font-semibold">{referrer.full_name}</span></>
          ) : (
            <>You&apos;ve been invited to <span className="gold-text font-semibold">Brigee Braids</span></>
          )}
        </h1>
        <p className="text-[--color-on-dark-muted] mb-8 leading-relaxed">
          Create an account and complete your first appointment to unlock your referral reward — and your friend earns one too.
        </p>
        <Link href={`/sign-up?ref=${code}`}>
          <Button size="lg" className="w-full mb-4">Create Account & Claim Reward</Button>
        </Link>
        <Link href="/sign-in">
          <Button variant="outline" size="sm" className="w-full">Already have an account? Sign In</Button>
        </Link>
      </div>
    </div>
  );
}
