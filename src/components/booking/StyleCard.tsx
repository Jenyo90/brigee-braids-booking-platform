import Image from "next/image";
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAUDFromDollars } from "@/lib/utils";
import type { Style } from "@/types/database";

const CATEGORY_LABELS: Record<string, string> = {
  knotless: "Knotless",
  box_braids: "Box Braids",
  locs: "Locs",
  twists: "Twists",
  cornrows: "Cornrows",
};

interface StyleCardProps {
  style: Style;
  onSelect?: (style: Style) => void;
  selected?: boolean;
}

export function StyleCard({ style, onSelect, selected }: StyleCardProps) {
  return (
    <div
      className={`border transition-colors ${
        selected
          ? "border-[--color-gold] bg-[--color-surface-2]"
          : "border-[--color-border] bg-[--color-surface-2] hover:border-[--color-gold]/50"
      }`}
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden bg-[--color-surface-3]">
        {style.images[0] ? (
          <Image
            src={style.images[0]}
            alt={style.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-5xl text-[--color-border]">BB</span>
          </div>
        )}
        <Badge variant="secondary" className="absolute top-3 left-3">
          {CATEGORY_LABELS[style.category]}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold mb-1">{style.name}</h3>
        {style.description && (
          <p className="text-xs text-[--color-on-dark-muted] leading-relaxed mb-3 line-clamp-2">
            {style.description}
          </p>
        )}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[--color-gold] font-medium text-sm">
            From {formatAUDFromDollars(style.price_min)}
          </span>
          <span className="flex items-center gap-1 text-xs text-[--color-on-dark-muted]">
            <Clock className="h-3 w-3" />
            {style.duration_min}–{style.duration_max} min
          </span>
        </div>

        {onSelect ? (
          <Button
            variant={selected ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={() => onSelect(style)}
          >
            {selected ? "Selected ✓" : "Select This Style"}
          </Button>
        ) : (
          <Link href={`/book?style=${style.id}`}>
            <Button variant="outline" size="sm" className="w-full gap-2">
              Book This Style
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
