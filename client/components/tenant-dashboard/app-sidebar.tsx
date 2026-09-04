"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronsUpDownIcon,
  FileTextIcon,
  HeartIcon,
  HouseIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useGetMeQuery, useLogoutMutation } from "@/state/api";

const navItems = [
  { title: "Overview", href: "/overview", icon: LayoutDashboardIcon },
  { title: "Applications", href: "/applications", icon: FileTextIcon },
  { title: "Residence", href: "/residence", icon: HouseIcon },
  { title: "Favorites", href: "/favorites", icon: HeartIcon },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useGetMeQuery();
  const [logout] = useLogoutMutation();
  const user = data?.user;

  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    try {
      await logout().unwrap();
    } finally {
      router.push("/");
    }
  };

  // Sits below the fixed full-width dashboard navbar (h-[72px])
  return (
    <Sidebar
      className="top-[72px]! h-[calc(100svh-72px)] border-r border-border [--sidebar-width:15rem]"
    >
      {/* Exit hatch back to the public listings/landing page */}
      {/* <SidebarHeader>
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              tooltip="Browse Properties"
            >
              <Image
                src="/logo.svg"
                alt="Habitat"
                width={32}
                height={32}
                className="size-8 shrink-0 brightness-0 dark:invert"
              />
              <span className="text-sm font-semibold leading-tight">
                Browse Properties
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader> */}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="relative mx-1 w-[calc(100%-0.5rem)] gap-3 rounded-lg px-3 py-2.5 font-normal text-muted-foreground data-active:bg-muted data-active:text-foreground data-active:font-medium data-active:before:absolute data-active:before:inset-y-2 data-active:before:left-0 data-active:before:w-0.5 data-active:before:rounded-full data-active:before:bg-primary [&_svg]:size-5 [&_svg]:text-muted-foreground data-active:[&_svg]:text-foreground"
                  >
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter>
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">
                    {user?.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="min-w-56">
                <DropdownMenuItem render={<Link href="/settings" />}>
                  <SettingsIcon />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
}
