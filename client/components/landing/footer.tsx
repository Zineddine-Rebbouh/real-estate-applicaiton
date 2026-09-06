import Image from "next/image";
import Link from "next/link";
import { Globe, MessageCircle, Send, Briefcase } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Blog", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Licenses", href: "#" },
  ],
  social: [
    { label: "Web", href: "#", icon: Globe },
    { label: "Chat", href: "#", icon: MessageCircle },
    { label: "Send", href: "#", icon: Send },
    { label: "Business", href: "#", icon: Briefcase },
  ],
};

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex">
              <span className="relative block h-10 w-[150px] overflow-hidden rounded-sm bg-white">
                <Image
                  src="/logo-habitat.png"
                  alt="Habitat"
                  width={240}
                  height={240}
                  className="absolute -left-[45px] -top-[102px] max-w-none"
                />
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              A considered way to find the place you&apos;ll build your everyday
              life around.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            © 2026 Habitat. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {footerLinks.social.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
