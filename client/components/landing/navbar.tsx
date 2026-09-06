"use client";

import { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMeQuery, useLogoutMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { SettingsDialog } from "@/components/settings/settings-dialog";

export interface NavbarProps {
  isDashboard?: boolean;
}

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Spaces", href: "#gallery" },
  { label: "Care", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export function Navbar({ isDashboard = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data } = useGetMeQuery();
  const [logout] = useLogoutMutation();
  const router = useRouter();
  const user = data?.user;
  const isManager = user?.role === "MANAGER";
  // Managers go to manager dashboard; tenants to tenant overview
  const profileHref =
    user?.role === "MANAGER" ? "/manager/overview" : "/tenant/overview";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TN";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Tenants browse public rentals; managers search their own portfolio.
      const dest = isManager ? "/manager/properties" : "/tenant/rentals";
      router.push(`${dest}?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Browse/map entry points are tenant-only; hide Listings link for managers.
  const visibleNavLinks = isManager ? navLinks : navLinks;

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
    <>
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
                  <SidebarTrigger className="-ml-1 text-white hover:bg-white/10 hover:text-white" />
                </div>
              )}
              <Link href="/" className="flex items-center">
                <span
                  className={`font-display text-2xl font-bold tracking-tight ${
                    isDashboard || !scrolled ? "text-white" : "text-foreground"
                  }`}
                >
                  Habitat
                </span>
              </Link>
            </div>

            {/* Search — tenant dashboard only (managers search their portfolio in-page) */}
            {isDashboard && !isManager ? (
              <div className="hidden w-full max-w-2xl flex-1 px-2 md:block">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/60"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search rentals"
                    placeholder="Search Rentals (press Enter to browse)..."
                    className="h-10 rounded-full border-white/10 bg-white/10 pl-10 text-white placeholder:text-white/60 focus-visible:bg-white/15 focus-visible:ring-white/20"
                  />
                </form>
              </div>
            ) : (
              <nav className="hidden lg:flex items-center gap-8">
                {visibleNavLinks.map((link) => (
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
              {/* Auth / Profile & Alerts */}
              <div className="flex items-center gap-2 sm:gap-3">
                {isDashboard && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      nativeButton={false}
                      aria-label="Messages"
                      render={<Link href={profileHref} />}
                      className="text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      <MessageSquare className="size-5" />
                    </Button>

                    {/* Interactive Notifications Preview */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            nativeButton={true}
                            aria-label="Notifications"
                            className="relative text-white/80 hover:bg-white/10 hover:text-white"
                          />
                        }
                      >
                        <Bell className="size-5" />
                        <span className="absolute top-2 right-2 flex size-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex size-2 rounded-full bg-rose-500"></span>
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-80 p-2 shadow-xl"
                      >
                        <div className="flex items-center justify-between border-b pb-2 px-2">
                          <span className="text-xs font-semibold">
                            Notifications
                          </span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            3 new
                          </span>
                        </div>
                        <div className="divide-y text-xs">
                          <div className="p-2 hover:bg-muted/50 rounded-md transition-colors">
                            <p className="font-medium text-foreground">
                              Application Approved 🎉
                            </p>
                            <p className="text-muted-foreground mt-0.5">
                              Your application for Willow Lane Residences was
                              approved.
                            </p>
                            <p className="text-[10px] text-muted-foreground/70 mt-1">
                              2 hours ago
                            </p>
                          </div>
                          <div className="p-2 hover:bg-muted/50 rounded-md transition-colors">
                            <p className="font-medium text-foreground">
                              Rent Payment Due
                            </p>
                            <p className="text-muted-foreground mt-0.5">
                              Next rent of $2,300 is scheduled for October 1,
                              2026.
                            </p>
                            <p className="text-[10px] text-muted-foreground/70 mt-1">
                              1 day ago
                            </p>
                          </div>
                          <div className="p-2 hover:bg-muted/50 rounded-md transition-colors">
                            <p className="font-medium text-foreground">
                              Maintenance Update
                            </p>
                            <p className="text-muted-foreground mt-0.5">
                              Annual HVAC inspection confirmed for this
                              Thursday.
                            </p>
                            <p className="text-[10px] text-muted-foreground/70 mt-1">
                              3 days ago
                            </p>
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button className="flex cursor-pointer items-center gap-2 rounded-full p-0.5 outline-hidden transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white" />
                      }
                    >
                      <Avatar size="sm" className="border border-white/20">
                        <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                          {initials}
                        </AvatarFallback>
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
                          className={`hidden sm:inline ${
                            scrolled ? "text-foreground" : "text-white"
                          }`}
                        >
                          {user.name}
                        </span>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 p-1.5 shadow-xl"
                    >
                      {/* <div className="px-2 py-1.5 border-b mb-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div> */}
                      <DropdownMenuItem
                        render={
                          <Link
                            href={profileHref}
                            className="flex items-center gap-2"
                          />
                        }
                      >
                        <UserRound className="size-4" />
                        <span>
                          {user.role === "MANAGER"
                            ? "Manager Dashboard"
                            : "Dashboard"}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSettingsOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <span className="flex items-center gap-2">
                          <Settings className="size-4" />
                          <span>Settings</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="size-4" />
                          <span>Logout</span>
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                      Sign in
                    </Button>
                    <Button
                      size="sm"
                      nativeButton={false}
                      render={<Link href="/sign-up" />}
                      className="rounded-none bg-[var(--brass)] text-sm font-medium text-white hover:bg-[#9c7027]"
                    >
                      Get started
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                      />
                    }
                  >
                    <Menu
                      className={`h-5 w-5 ${scrolled ? "text-foreground" : "text-white"}`}
                    />
                  </SheetTrigger>
                  <SheetContent>
                    <nav className="flex flex-col gap-6 mt-8">
                      {visibleNavLinks.map((link) => (
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
                            <button
                              onClick={() => setSettingsOpen(true)}
                              className="flex items-center gap-2 text-base font-medium hover:text-primary transition-colors"
                            >
                              <Settings className="size-4" />
                              Settings
                            </button>
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
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
