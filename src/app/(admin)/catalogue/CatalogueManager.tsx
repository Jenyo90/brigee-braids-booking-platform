"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Eye, EyeOff, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatAUDFromDollars } from "@/lib/utils";
import type { Style, StyleCategory } from "@/types/database";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const CATEGORIES: { value: StyleCategory; label: string }[] = [
  { value: "knotless", label: "Knotless" },
  { value: "box_braids", label: "Box Braids" },
  { value: "locs", label: "Locs" },
  { value: "twists", label: "Twists" },
  { value: "cornrows", label: "Cornrows" },
];

const styleSchema = z.object({
  name: z.string().min(2),
  category: z.enum(["knotless", "box_braids", "locs", "twists", "cornrows"]),
  description: z.string().optional(),
  duration_min: z.coerce.number().min(30),
  duration_max: z.coerce.number().min(30),
  price_min: z.coerce.number().min(0),
  price_max: z.coerce.number().min(0),
});

type StyleForm = z.infer<typeof styleSchema>;

interface CatalogueManagerProps {
  initialStyles: Style[];
}

export function CatalogueManager({ initialStyles }: CatalogueManagerProps) {
  const [styles, setStyles] = useState(initialStyles);
  const [open, setOpen] = useState(false);
  const [editStyle, setEditStyle] = useState<Style | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newImages, setNewImages] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<StyleForm>({
    resolver: zodResolver(styleSchema) as Resolver<StyleForm>,
  });

  const openCreate = () => {
    setEditStyle(null);
    setNewImages([]);
    reset();
    setOpen(true);
  };

  const openEdit = (style: Style) => {
    setEditStyle(style);
    setNewImages(style.images);
    reset({
      name: style.name,
      category: style.category,
      description: style.description ?? "",
      duration_min: style.duration_min,
      duration_max: style.duration_max,
      price_min: style.price_min,
      price_max: style.price_max,
    });
    setOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setUploading(true);
    for (const file of files) {
      const path = `styles/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("style-images").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("style-images").getPublicUrl(path);
        setNewImages((prev) => [...prev, data.publicUrl]);
      }
    }
    setUploading(false);
  };

  const onSubmit = async (data: StyleForm) => {
    const payload = { ...data, images: newImages, colour_suggestions: editStyle?.colour_suggestions ?? [] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    if (editStyle) {
      const { error } = await db.from("styles").update(payload).eq("id", editStyle.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      setStyles((prev) => prev.map((s) => s.id === editStyle.id ? { ...s, ...payload } : s));
      toast({ title: "Style updated", variant: "success" });
    } else {
      const { data: newStyle, error } = await db.from("styles").insert({ ...payload, is_active: true }).select().single();
      if (error || !newStyle) { toast({ title: "Error", description: error?.message, variant: "destructive" }); return; }
      setStyles((prev) => [...prev, newStyle as Style]);
      toast({ title: "Style created", variant: "success" });
    }
    setOpen(false);
  };

  const toggleActive = async (style: Style) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("styles").update({ is_active: !style.is_active }).eq("id", style.id);
    if (!error) setStyles((prev) => prev.map((s) => s.id === style.id ? { ...s, is_active: !s.is_active } : s));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Style
        </Button>
      </div>

      <div className="border border-[--color-border] bg-[--color-surface-2] overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[--color-surface-3] border-b border-[--color-border]">
            <tr>
              {["Style", "Category", "Duration", "Price", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[--color-on-dark-muted] font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {styles.map((s) => (
              <tr key={s.id} className="border-b border-[--color-border] hover:bg-[--color-surface-3]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.images[0] && (
                      <div className="w-10 h-10 relative overflow-hidden bg-[--color-surface-3]">
                        <Image src={s.images[0]} alt={s.name} fill className="object-cover" />
                      </div>
                    )}
                    <span className="font-medium">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{s.category.replace("_", " ")}</td>
                <td className="px-4 py-3">{s.duration_min}–{s.duration_max} min</td>
                <td className="px-4 py-3 text-[--color-gold]">
                  {formatAUDFromDollars(s.price_min)}–{formatAUDFromDollars(s.price_max)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={s.is_active ? "success" : "secondary"}>{s.is_active ? "Active" : "Hidden"}</Badge>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(s)}>
                    {s.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editStyle ? "Edit Style" : "Add New Style"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Name</label>
              <Input {...register("name")} placeholder="e.g. Knotless Box Braids" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Category</label>
              <Select value={watch("category")} onValueChange={(v) => setValue("category", v as StyleCategory)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Description</label>
              <textarea className="w-full bg-[--color-surface-2] border border-[--color-border] focus:border-[--color-gold] outline-none p-3 text-sm text-[--color-on-dark] resize-none h-20" {...register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Min Duration (min)</label>
                <Input type="number" {...register("duration_min")} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Max Duration (min)</label>
                <Input type="number" {...register("duration_max")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Min Price ($)</label>
                <Input type="number" step="0.01" {...register("price_min")} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Max Price ($)</label>
                <Input type="number" step="0.01" {...register("price_max")} />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-2 block">Images</label>
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-[--color-border] hover:border-[--color-gold] p-3 transition-colors">
                <Upload className="h-4 w-4 text-[--color-on-dark-muted]" />
                <span className="text-sm text-[--color-on-dark-muted]">{uploading ? "Uploading…" : "Upload images"}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
              {newImages.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {newImages.map((url) => (
                    <div key={url} className="relative w-14 h-14 overflow-hidden bg-[--color-surface-3]">
                      <Image src={url} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || uploading}>
              {isSubmitting ? "Saving…" : editStyle ? "Update Style" : "Create Style"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
