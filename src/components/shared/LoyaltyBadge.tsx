import { Badge } from "@/components/ui/badge";
import type { LoyaltyTier } from "@/types/database";
import { getLoyaltyProgress } from "@/lib/utils";

const TIER_CONFIG: Record<LoyaltyTier, { label: string; variant: "secondary" | "silver" | "gold" | "diamond"; emoji: string }> = {
  none: { label: "Member", variant: "secondary", emoji: "○" },
  silver: { label: "Silver", variant: "silver", emoji: "◈" },
  gold: { label: "Gold", variant: "gold", emoji: "◆" },
  diamond: { label: "Diamond", variant: "diamond", emoji: "◇" },
};

interface LoyaltyBadgeProps {
  tier: LoyaltyTier;
  completedAppointments: number;
  showProgress?: boolean;
}

export function LoyaltyBadge({ tier, completedAppointments, showProgress = false }: LoyaltyBadgeProps) {
  const config = TIER_CONFIG[tier];
  const progress = getLoyaltyProgress(completedAppointments);

  return (
    <div>
      <Badge variant={config.variant} className="gap-1">
        {config.emoji} {config.label}
      </Badge>

      {showProgress && tier !== "diamond" && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-[--color-on-dark-muted] mb-1">
            <span>{progress.current} / {progress.next} visits to {progress.label}</span>
          </div>
          <div className="h-1 bg-[--color-surface-3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[--color-gold] transition-all duration-500"
              style={{ width: `${(progress.current / progress.next) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
