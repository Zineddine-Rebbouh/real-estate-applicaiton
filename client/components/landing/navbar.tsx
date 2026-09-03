"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data } = useGetMeQuery();
  const [logout] = useLogoutMutation();
  const router = useRouter();
  const user = data?.user;
  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-white/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Habitat"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span
              className={`font-display font-semibold text-lg ${scrolled ? "text-foreground" : "text-white"}`}
            >
              RealEstate
            </span>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <details className="relative">
                  <summary className="flex cursor-pointer list-none items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span
                      className={scrolled ? "text-foreground" : "text-white"}
                    >
                      {user.name}
                    </span>
                  </summary>
                  <div className="absolute right-0 mt-3 w-44 rounded-md border border-border bg-background p-1 text-foreground shadow-lg">
                    <Link
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted"
                      href="/profile"
                    >
                      <UserRound className="size-4" /> Profile
                    </Link>
                    <Link
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted"
                      href="/settings"
                    >
                      Settings
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
                      scrolled
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

            {/* Mobile Menu */}
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
                          href="/profile"
                          className="block text-base font-medium hover:text-primary transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="block text-base font-medium hover:text-primary transition-colors"
                        >
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
          </div>
        </div>
      </div>
    </header>
  );
}
