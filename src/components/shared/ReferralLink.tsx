"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReferralLinkProps {
  referralCode: string;
}

export function ReferralLink({ referralCode }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/sign-up?ref=${referralCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-2">Your Referral Link</p>
      <div className="flex gap-2">
        <Input value={referralUrl} readOnly className="text-xs font-mono" />
        <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-[--color-on-dark-muted] mt-2">
        Share this link — both you and your friend receive a reward when they complete their first appointment.
      </p>
    </div>
  );
}
