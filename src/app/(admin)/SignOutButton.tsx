"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-3 px-2 py-2 text-xs text-[--color-on-dark-muted] hover:text-red-400 transition-colors w-full"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
