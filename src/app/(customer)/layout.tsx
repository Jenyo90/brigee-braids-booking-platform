import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ToastProvider } from "@/components/ui/toast";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profileRaw } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const profile = profileRaw as { role: string } | null;
    isAdmin = profile?.role === "admin";
  }

  return (
    <ToastProvider>
      <Navbar user={user} isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
      <Footer />
    </ToastProvider>
  );
}
