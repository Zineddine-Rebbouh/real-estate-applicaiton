"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileTextIcon,
  HeartIcon,
  HouseIcon,
  LayoutDashboardIcon,
  CreditCardIcon,
  Building2Icon,
  CompassIcon,
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


export interface AppSidebarProps {
  userType?: "manager" | "tenant";
}

const tenantNavItems = [
  {
    title: "Overview",
    href: "/tenant/overview",
    icon: LayoutDashboardIcon,
    badge: null,
  },
  {
    title: "Browse Rentals",
    href: "/tenant/rentals",
    icon: CompassIcon,
    badge: null,
  },
  {
    title: "Map Search",
    href: "/tenant/explore",
    icon: MapIcon,
    badge: null,
  },
  {
    title: "Applications",
    href: "/tenant/applications",
    icon: FileTextIcon,
    badge: "2",
  },
  {
    title: "Residence",
    href: "/tenant/residence",
    icon: HouseIcon,
    badge: null,
  },
  {
    title: "Favorites",
    href: "/tenant/favorites",
    icon: HeartIcon,
    badge: "6",
  },
  {
    title: "Billing History",
    href: "/tenant/billing",
    icon: FileTextIcon,
    badge: null,
  },
  {
    title: "Payment Methods",
    href: "/tenant/payment-methods",
    icon: CreditCardIcon,
    badge: null,
  },
] as const;

const managerNavItems = [
  {
    title: "Overview",
    href: "/manager/overview",
    icon: LayoutDashboardIcon,
    badge: null,
  },
  {
    title: "Properties",
    href: "/manager/properties",
    icon: Building2Icon,
    badge: null,
  },
  {
    title: "Applications",
    href: "/manager/applications",
    icon: FileTextIcon,
    badge: null,
  },
  {
    title: "Leases",
    href: "/manager/leases",
    icon: CreditCardIcon,
    badge: null,
  },
] as const;

export function AppSidebar({ userType = "tenant" }: AppSidebarProps = {}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const navItems = userType === "manager" ? managerNavItems : tenantNavItems;

  return (
    <Sidebar
      collapsible="icon"
      className="top-[72px]! h-[calc(100svh-72px)] border-r border-border bg-sidebar [--sidebar-width:16rem]"
    >
      <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:pt-14">


        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {userType === "manager" ? "Management" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/tenant/overview" &&
                    item.href !== "/manager/overview" &&
                    pathname.startsWith(item.href));

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
                      href="/tenant/overview"
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
