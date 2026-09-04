"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetMeQuery, useLogoutMutation } from "@/state/api";
import { useRouter } from "next/navigation";

const navLinks = [
  { label: "Start", href: "#" },
  { label: "About", href: "#about" },
  { label: "Listings", href: "#listings" },
  { label: "Features", href: "#features" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export function Navbar({ isDashboard = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const { data } = useGetMeQuery();
  const [logout] = useLogoutMutation();
  const router = useRouter();
  const user = data?.user;
  // Tenants go straight to their dashboard; other roles keep /profile for now.
  const profileHref = user?.role === "TENANT" ? "/overview" : "/profile";
  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // The dashboard header is always solid; the landing header is transparent
  // over the hero until the user scrolls.
  const solid = isDashboard || scrolled;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      router.push("/");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={
        isDashboard
          ? "fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-neutral-900"
          : `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
              scrolled
                ? "bg-background/80 backdrop-blur-md border-b border-border"
                : "bg-transparent border-b border-white/10"
            }`
      }
    >
      <div
        className={`mx-auto px-4 sm:px-6 lg:px-8 ${
          isDashboard ? "w-full max-w-none" : "max-w-7xl"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {isDashboard && (
              <div className="md:hidden">
                <SidebarTrigger className="-ml-1" />
              </div>
            )}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Habitat"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span
                className={`font-display font-semibold text-lg ${isDashboard ? "text-white" : solid ? "text-foreground" : "text-white"}`}
              >
                RealEstate
              </span>
            </Link>
          </div>

          {/* Search — dashboard only, sits next to the logo like the reference */}
          {isDashboard ? (
            <div className="hidden w-full max-w-2xl flex-1 px-2 md:block">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/60"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  aria-label="Search rentals"
                  placeholder="Search Rentals"
                  className="h-10 rounded-full border-white/10 bg-white/10 pl-10 text-white placeholder:text-white/60"
                />
              </div>
            </div>
          ) : (
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    scrolled
                      ? "text-foreground"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {isDashboard && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Messages"
                    className="text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <MessageSquare className="size-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notifications"
                    className="text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <Bell className="size-5" />
                  </Button>
                </div>
              )}
              {user ? (
                <details className="relative">
                  <summary className="flex cursor-pointer list-none items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {isDashboard ? (
                      <span className="hidden text-left leading-tight lg:block">
                        <span className="block text-sm font-medium text-white">
                          {user.name}
                        </span>
                        <span className="block text-xs text-white/60">
                          {user.role === "TENANT" ? "Tenant" : "Manager"}
                        </span>
                      </span>
                    ) : (
                      <span
                        className={scrolled ? "text-foreground" : "text-white"}
                      >
                        {user.name}
                      </span>
                    )}
                  </summary>
                  <div className="absolute right-0 mt-3 w-44 rounded-md border border-border bg-background p-1 text-foreground shadow-lg">
                    <Link
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted"
                      href={profileHref}
                    >
                      <UserRound className="size-4" /> Profile
                    </Link>
                    <Link
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted"
                      href="/settings"
                    >
                      <Settings className="size-4" /> Settings
                    </Link>
                    <button
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={handleLogout}
                    >
                      <LogOut className="size-4" /> Logout
                    </button>
                  </div>
                </details>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={<Link href="/sign-in" />}
                    className={
                      isDashboard
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : solid
                          ? "text-foreground"
                          : "text-white hover:text-white"
                    }
                  >
                    Log in
                  </Button>
                  <Button
                    size="sm"
                    nativeButton={false}
                    render={<Link href="/sign-up" />}
                    className="text-sm font-medium"
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>

            {/* Locale Toggle - Hidden when not logged in */}
            {/* <div
              className={`hidden md:flex items-center gap-2 text-sm ${scrolled ? "text-foreground" : "text-white"}`}
            >
              <button className="font-medium">EN</button>
              <span className="text-muted-foreground">/</span>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                PL
              </button>
            </div> */}

            {/* User Chip - Hidden when not logged in */}
            {/* <div className="hidden md:flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback>WZ</AvatarFallback>
              </Avatar>
              <span
                className={`text-sm ${scrolled ? "text-foreground" : "text-white"}`}
              >
                Wroclaw
              </span>
            </div> */}

            {/* Mobile Menu — landing only */}
            {!isDashboard && (
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="lg:hidden" />
                }
              >
                <Menu
                  className={`h-5 w-5 ${scrolled ? "text-foreground" : "text-white"}`}
                />
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-base font-medium hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* Mobile Auth Links */}
                  <div className="pt-6 border-t border-border space-y-3">
                    {user ? (
                      <>
                        <Link
                          href={profileHref}
                          className="block text-base font-medium hover:text-primary transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 text-base font-medium hover:text-primary transition-colors"
                        >
                          <Settings className="size-4" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block text-base font-medium hover:text-primary transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/sign-in"
                          className="block text-base font-medium hover:text-primary transition-colors"
                        >
                          Log in
                        </Link>
                        <Link
                          href="/sign-up"
                          className="block text-base font-medium text-primary hover:underline"
                        >
                          Sign up
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
