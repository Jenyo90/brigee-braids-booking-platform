import { createClient } from "@/lib/supabase/server";
import { formatAUDFromDollars } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CatalogueManager } from "./CatalogueManager";
import type { Style } from "@/types/database";

export const metadata = { title: "Style Catalogue — Admin" };

export default async function AdminCataloguePage() {
  const supabase = await createClient();
  const { data: stylesRaw } = await supabase
    .from("styles")
    .select("*")
    .order("category")
    .order("name");
  const styles = stylesRaw as Style[] | null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-semibold">Style Catalogue</h1>
      </div>
      <CatalogueManager initialStyles={styles ?? []} />
    </div>
  );
}
