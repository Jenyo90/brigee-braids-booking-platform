import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoyaltyBadge } from "@/components/shared/LoyaltyBadge";
import { ReferralLink } from "@/components/shared/ReferralLink";
import { Badge } from "@/components/ui/badge";
import { formatAUDFromDollars, formatDate } from "@/lib/utils";
import type { Profile, LoyaltyRecord, ReferralConversion } from "@/types/database";

type ReferralWithProfile = ReferralConversion & { profiles: { full_name: string | null } | null };

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?redirect=/profile");

  const [r1, r2, r3] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("loyalty_records").select("*").eq("user_id", user.id).single(),
    supabase.from("referral_conversions").select("*, profiles!referral_conversions_referee_id_fkey(full_name)").eq("referrer_id", user.id),
  ]);
  const profile = r1.data as Profile | null;
  const loyalty = r2.data as LoyaltyRecord | null;
  const referrals = r3.data as ReferralWithProfile[] | null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-light mb-1">My Profile</h1>
        <p className="text-[--color-on-dark-muted] text-sm">{profile?.email}</p>
      </div>

      {/* Profile details */}
      <div className="border border-[--color-border] bg-[--color-surface-2] p-6 mb-6">
        <h2 className="font-serif text-xl mb-4">Personal Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1">Full Name</p>
            <p>{profile?.full_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1">Phone</p>
            <p>{profile?.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1">Instagram</p>
            <p>{profile?.instagram ? `@${profile.instagram}` : "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1">TikTok</p>
            <p>{profile?.tiktok ? `@${profile.tiktok}` : "—"}</p>
          </div>
        </div>
      </div>

      {/* Loyalty */}
      {loyalty && (
        <div className="border border-[--color-border] bg-[--color-surface-2] p-6 mb-6">
          <h2 className="font-serif text-xl mb-4">Loyalty Status</h2>
          <div className="mb-4">
            <LoyaltyBadge
              tier={loyalty.tier}
              completedAppointments={loyalty.completed_appointments}
              showProgress
            />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1">Completed Visits</p>
              <p className="text-2xl font-serif font-semibold">{loyalty.completed_appointments}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1">Total Spent</p>
              <p className="text-2xl font-serif font-semibold">{formatAUDFromDollars(loyalty.total_spent)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Referrals */}
      {profile?.referral_code && (
        <div className="border border-[--color-border] bg-[--color-surface-2] p-6 mb-6">
          <h2 className="font-serif text-xl mb-4">Refer a Friend</h2>
          <ReferralLink referralCode={profile.referral_code} />

          {referrals && referrals.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-3">Your Referrals</p>
              <div className="space-y-2">
                {referrals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm border-b border-[--color-border] pb-2">
                    <span>{r.profiles?.full_name ?? "Friend"}</span>
                    <Badge variant={r.reward_applied ? "success" : "outline"}>
                      {r.reward_applied ? "Reward applied" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hair profile */}
      <div className="border border-[--color-border] bg-[--color-surface-2] p-6">
        <h2 className="font-serif text-xl mb-4">Hair Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1">Hair Length</p>
            <p>{profile?.hair_length ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1">Hair Texture</p>
            <p>{profile?.hair_texture ?? "Not set"}</p>
          </div>
        </div>
        <a href="/profile/edit" className="text-xs text-[--color-gold] hover:underline mt-4 block">
          Edit Profile →
        </a>
      </div>
    </div>
  );
}
