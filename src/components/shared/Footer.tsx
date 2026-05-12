import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[--color-surface-2] border-t border-[--color-border] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-xl gold-text mb-3">Brigee Braids</h3>
            <p className="text-sm text-[--color-on-dark-muted] leading-relaxed">
              Premium hair braiding services in Gosford and on the Central Coast, NSW. Mobile service available across the Central Coast and greater Sydney.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[--color-gold] mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-[--color-on-dark-muted]">
              {[
                { href: "/services", label: "Services" },
                { href: "/book", label: "Book an Appointment" },
                { href: "/appointments", label: "My Appointments" },
                { href: "/profile", label: "My Profile" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[--color-gold] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[--color-gold] mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-[--color-on-dark-muted]">
              <li>Gosford, NSW 2250</li>
              <li>Central Coast & Greater Sydney</li>
              <li>
                <a href="mailto:stylistbree@brigeebraids.com" className="hover:text-[--color-gold] transition-colors">
                  stylistbree@brigeebraids.com
                </a>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[--color-on-dark-muted] hover:text-[--color-gold] transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[--color-on-dark-muted] hover:text-[--color-gold] transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[--color-border] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[--color-on-dark-muted]">
          <p>© {new Date().getFullYear()} Brigee Braids. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[--color-gold] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[--color-gold] transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
