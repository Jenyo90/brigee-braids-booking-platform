import { createClient } from "@/lib/supabase/server";
import { StyleCard } from "@/components/booking/StyleCard";
import { Badge } from "@/components/ui/badge";
import type { StyleCategory, Style } from "@/types/database";

const CATEGORIES: { value: StyleCategory | "all"; label: string }[] = [
  { value: "all", label: "All Styles" },
  { value: "knotless", label: "Knotless" },
  { value: "box_braids", label: "Box Braids" },
  { value: "locs", label: "Locs" },
  { value: "twists", label: "Twists" },
  { value: "cornrows", label: "Cornrows" },
];

interface ServicesPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("styles").select("*").eq("is_active", true).order("name");

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data: stylesRaw } = await query;
  const styles = stylesRaw as Style[] | null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">Style Catalogue</Badge>
        <h1 className="font-serif text-5xl font-light mb-4">
          Our <span className="gold-text font-semibold">Services</span>
        </h1>
        <p className="text-[--color-on-dark-muted] max-w-xl mx-auto">
          Choose from our range of premium braiding styles. Each service includes a personalised consultation and post-care advice.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {CATEGORIES.map((cat) => (
          <a
            key={cat.value}
            href={cat.value === "all" ? "/services" : `/services?category=${cat.value}`}
          >
            <Badge
              variant={
                (category === cat.value) || (cat.value === "all" && !category)
                  ? "default"
                  : "outline"
              }
              className="cursor-pointer text-sm px-4 py-1.5"
            >
              {cat.label}
            </Badge>
          </a>
        ))}
      </div>

      {/* Styles grid */}
      {styles && styles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {styles.map((style) => (
            <StyleCard key={style.id} style={style} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-[--color-on-dark-muted]">
          <p className="font-serif text-2xl">No styles found</p>
          <p className="text-sm mt-2">Check back soon — new styles are added regularly.</p>
        </div>
      )}
    </div>
  );
}
