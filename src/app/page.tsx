import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatAUDFromDollars } from "@/lib/utils";
import { Sparkles, Clock, Shield, Star } from "lucide-react";
import type { Style } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: featuredStylesRaw } = await supabase
    .from("styles")
    .select("*")
    .eq("is_active", true)
    .limit(4);
  const featuredStyles = featuredStylesRaw as Style[] | null;

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-[--color-gold-dark] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-6">Gosford, NSW · Central Coast & Sydney</Badge>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-[--color-on-dark] leading-tight mb-6">
            Braids That Tell
            <span className="block gold-text font-semibold">Your Story</span>
          </h1>
          <p className="text-[--color-on-dark-muted] text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Premium Afrocentric braiding delivered to your home or at our studio. Book online in minutes — AI style suggestions included.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button size="lg" className="w-full sm:w-auto">
                Book Your Appointment
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Services
              </Button>
            </Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[--color-on-dark-muted]">
          <div className="w-px h-12 bg-gradient-to-b from-[--color-gold] to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[--color-surface-2]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Sparkles, title: "AI Style Suggestions", desc: "Upload a photo and get personalised braid recommendations." },
            { icon: Clock, title: "Flexible Scheduling", desc: "Choose morning or afternoon slots, including recurring bookings." },
            { icon: Shield, title: "Secure Payments", desc: "Pay your 10% deposit online. Stripe-secured, EFTPOS accepted." },
            { icon: Star, title: "Loyalty Rewards", desc: "Earn Silver, Gold, and Diamond tier rewards with every visit." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-[--color-gold] text-[--color-gold]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-[--color-on-dark-muted] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Styles */}
      {featuredStyles && featuredStyles.length > 0 && (
        <section className="py-20 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Style Catalogue</Badge>
            <h2 className="font-serif text-4xl font-light">
              Find Your <span className="gold-text font-semibold">Perfect Look</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredStyles.map((style) => (
              <Link key={style.id} href={`/services?style=${style.id}`} className="group">
                <div className="aspect-[3/4] bg-[--color-surface-2] border border-[--color-border] overflow-hidden relative">
                  {style.images[0] ? (
                    <Image
                      src={style.images[0]}
                      alt={style.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-serif text-4xl text-[--color-border]">BB</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-serif text-lg font-semibold">{style.name}</p>
                    <p className="text-xs text-[--color-gold] mt-1">
                      From {formatAUDFromDollars(style.price_min)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services">
              <Button variant="outline">View All Styles</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Loyalty section */}
      <section className="py-20 bg-[--color-surface-2] border-t border-[--color-border]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">Loyalty Program</Badge>
          <h2 className="font-serif text-4xl font-light mb-4">
            Rewards That <span className="gold-text font-semibold">Shine</span>
          </h2>
          <p className="text-[--color-on-dark-muted] mb-12 max-w-xl mx-auto">
            Every visit earns you status. Reach Silver, Gold, or Diamond tier and unlock exclusive rewards and priority booking.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {[
              { tier: "Silver", visits: "5 visits", color: "text-slate-300" },
              { tier: "Gold", visits: "10 visits", color: "text-[--color-gold]" },
              { tier: "Diamond", visits: "20 visits", color: "text-cyan-400" },
            ].map(({ tier, visits, color }) => (
              <div key={tier} className="bg-black border border-[--color-border] p-6 text-center">
                <p className={`font-serif text-2xl font-semibold ${color} mb-1`}>{tier}</p>
                <p className="text-xs text-[--color-on-dark-muted] uppercase tracking-wider">{visits}</p>
              </div>
            ))}
          </div>
          <Link href="/sign-up" className="mt-8 inline-block">
            <Button>Join & Start Earning</Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="font-serif text-4xl font-light mb-4">
          Ready to <span className="gold-text font-semibold">Book?</span>
        </h2>
        <p className="text-[--color-on-dark-muted] mb-8 max-w-md mx-auto">
          Secure your slot with a 10% deposit. Mobile service available across the Central Coast and up to 100km away.
        </p>
        <Link href="/book">
          <Button size="lg">Book Your Appointment</Button>
        </Link>
      </section>
    </>
  );
}
