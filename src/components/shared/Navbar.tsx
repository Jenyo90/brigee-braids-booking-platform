"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, User, Calendar, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user?: { id: string; email?: string } | null;
  isAdmin?: boolean;
}

export function Navbar({ user, isAdmin }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/book", label: "Book Now" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-[--color-border]">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold gold-text">
            Brigee Braids
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-xs uppercase tracking-widest font-medium transition-colors",
                pathname === l.href
                  ? "text-[--color-gold]"
                  : "text-[--color-on-dark-muted] hover:text-[--color-on-dark]"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/appointments">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointments
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/book">
                <Button size="sm">Book Now</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-[--color-on-dark]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[--color-surface-2] border-t border-[--color-border] px-4 py-6 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "text-sm uppercase tracking-widest font-medium py-2",
                pathname === l.href ? "text-[--color-gold]" : "text-[--color-on-dark]"
              )}
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t border-[--color-border] pt-4 flex flex-col gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin/dashboard" onClick={() => setOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">Admin Dashboard</Button>
                  </Link>
                )}
                <Link href="/appointments" onClick={() => setOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">My Appointments</Button>
                </Link>
                <Link href="/profile" onClick={() => setOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">Profile</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link href="/book" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full">Book Now</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
