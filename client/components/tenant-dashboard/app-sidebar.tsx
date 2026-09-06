"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CompassIcon,
  FileTextIcon,
  HeartIcon,
  HouseIcon,
  LayoutDashboardIcon,
  CreditCardIcon,
  MapIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarCollapseButton,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Overview",
    href: "/overview",
    icon: LayoutDashboardIcon,
    badge: null,
  },
  {
    title: "Applications",
    href: "/applications",
    icon: FileTextIcon,
    badge: "2",
  },
  {
    title: "Residence",
    href: "/residence",
    icon: HouseIcon,
    badge: null,
  },
  // {
  //   title: "Billing",
  //   href: "/billing",
  //   icon: ReceiptTextIcon,
  //   badge: null,
  // },
  {
    title: "Favorites",
    href: "/favorites",
    icon: HeartIcon,
    badge: "6",
  },
  {
    title: "Billing History",
    href: "/billing",
    icon: FileTextIcon,
    badge: null,
  },
  {
    title: "Payment Methods",
    href: "/payment-methods",
    icon: CreditCardIcon,
    badge: null,
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="top-[72px]! h-[calc(100svh-72px)] border-r border-border bg-sidebar [--sidebar-width:16rem]"
    >
      {/* Sidebar Header with quick link to public search */}
      {/* <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={handleNavClick}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Image
                src="/logo.svg"
                alt="Habitat logo"
                width={20}
                height={20}
                className="size-5 invert"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                Habitat Rentals
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                Tenant Portal
              </span>
            </div>
          </Link>
        </div>
      </SidebarHeader> */}

      <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:pt-14">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/overview" && pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={
                        <Link href={item.href} onClick={handleNavClick} />
                      }
                      isActive={isActive}
                      tooltip={item.title}
                      className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
                    >
                      <item.icon className="size-4.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground group-data-active:text-primary" />
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <SidebarMenuBadge className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary group-data-active:bg-primary group-data-active:text-primary-foreground">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Explore
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/explore" onClick={handleNavClick} />}
                  isActive={
                    pathname === "/explore" ||
                    pathname.startsWith("/explore")
                  }
                  tooltip="Interactive Map Search"
                  className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
                >
                  <MapIcon className="size-4.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground group-data-active:text-primary" />
                  <span className="flex-1 truncate">Map Search</span>
                  <SidebarMenuBadge className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary group-data-active:bg-primary group-data-active:text-primary-foreground">
                    Live
                  </SidebarMenuBadge>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/rentals" onClick={handleNavClick} />}
                  isActive={
                    pathname === "/rentals" ||
                    pathname.startsWith("/rentals")
                  }
                  tooltip="Browse Verified Listings"
                  className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
                >
                  <CompassIcon className="size-4.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground group-data-active:text-primary" />
                  <span className="flex-1 truncate">Browse Listings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile & Account Actions in Footer */}
      {/* <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="w-full justify-between rounded-lg p-2 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-popup-open:bg-sidebar-accent"
                  />
                }
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="size-8 rounded-lg border border-border">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight min-w-0">
                    <span className="truncate text-xs font-semibold text-sidebar-foreground">
                      {user?.name ?? "Verified Tenant"}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {user?.email ?? "tenant@habitat.com"}
                    </span>
                  </div>
                </div>
                <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56 rounded-xl p-1.5 shadow-lg"
              >
                <DropdownMenuItem
                  onClick={handleNavClick}
                  render={
                    <Link
                      href="/overview"
                      className="flex items-center gap-2"
                    />
                  }
                >
                  <UserRoundIcon className="size-4" />
                  <span>Dashboard Overview</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleNavClick}
                  render={
                    <Link
                      href="/settings"
                      className="flex items-center gap-2"
                    />
                  }
                >
                  <SettingsIcon className="size-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOutIcon className="size-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}

      <SidebarRail />
      <SidebarCollapseButton className="absolute top-3 right-2" />
    </Sidebar>
  );
}
