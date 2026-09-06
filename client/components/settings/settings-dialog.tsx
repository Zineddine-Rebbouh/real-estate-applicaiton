"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  CheckIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  ShieldCheckIcon,
  SunIcon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  useGetMeQuery,
  useLogoutMutation,
  useUpdateMeMutation,
} from "@/state/api";

type Section = "profile" | "notifications" | "appearance" | "account";

const sections: { id: Section; label: string; icon: typeof BellIcon }[] = [
  { id: "profile", label: "Profile", icon: UserRoundIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "appearance", label: "Appearance", icon: PaletteIcon },
  { id: "account", label: "Account", icon: ShieldCheckIcon },
];

function usePersistentState(key: string, initial: boolean) {
  const [value, setValue] = React.useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? raw === "1" : initial;
    } catch {
      return initial; // private mode etc. — fall back to default
    }
  });
  const set = (next: boolean) => {
    setValue(next);
    try {
      localStorage.setItem(key, next ? "1" : "0");
    } catch {
      // ignore
    }
  };
  return [value, set] as const;
}

function Row({
  label,
  hint,
  control,
}: {
  label: string;
  hint?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {control}
    </div>
  );
}

function ProfilePane({
  user,
}: {
  user: NonNullable<ReturnType<typeof useGetMeQuery>["data"]>["user"];
}) {
  const isManager = user.role === "MANAGER";
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  const [name, setName] = React.useState(user.name ?? "");
  const [phone, setPhone] = React.useState(user.phoneNumber ?? "");
  const [dirty, setDirty] = React.useState(false);

  const initials = (name || user.name || "?")
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveProfile = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    try {
      await updateMe({
        name: trimmed,
        phoneNumber: phone.trim() === "" ? null : phone.trim(),
      }).unwrap();
      setDirty(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Couldn't save — try again");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name ?? "—"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {user.email ?? "—"} · {isManager ? "Manager" : "Tenant"}
          </p>
        </div>
      </div>
      <Separator />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="settings-name">Full name</Label>
          <Input
            id="settings-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setDirty(true);
            }}
            autoComplete="name"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="settings-phone">Phone number</Label>
          <Input
            id="settings-phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setDirty(true);
            }}
            placeholder={
              isManager
                ? "Shown to applicants on your listings"
                : "Used for viewing appointments"
            }
            autoComplete="tel"
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="settings-email">Email</Label>
        <Input id="settings-email" value={user.email ?? ""} disabled />
        <p className="text-xs text-muted-foreground">
          Email is your login and can&apos;t be changed here.
        </p>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button onClick={handleSaveProfile} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [section, setSection] = React.useState<Section>("profile");
  const { data } = useGetMeQuery();
  const user = data?.user;
  const isManager = user?.role === "MANAGER";

  const [logout, { isLoading: signingOut }] = useLogoutMutation();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [emailUpdates, setEmailUpdates] = usePersistentState(
    "habitat.settings.email-updates",
    true,
  );
  const [productNews, setProductNews] = usePersistentState(
    "habitat.settings.product-news",
    false,
  );
  const [rentReminders, setRentReminders] = usePersistentState(
    "habitat.settings.rent-reminders",
    true,
  );
  const [applicationAlerts, setApplicationAlerts] = usePersistentState(
    "habitat.settings.application-alerts",
    true,
  );

  const handleSignOut = async () => {
    try {
      await logout().unwrap();
    } finally {
      onOpenChange(false);
      router.push("/");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle className="text-base">Settings</DialogTitle>
          <DialogDescription>
            {isManager ? "Manager workspace" : "Tenant workspace"} ·{" "}
            {user?.email ?? "your account"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[200px_1fr]">
          {/* Section nav — horizontal scroll on mobile, sidebar on desktop */}
          <nav className="flex gap-1 overflow-x-auto border-b p-2 md:flex-col md:border-r md:border-b-0 md:p-3">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  section === s.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <s.icon className="size-4 shrink-0" />
                {s.label}
              </button>
            ))}
          </nav>

          {/* Section content */}
          <div className="max-h-[60vh] min-h-[320px] overflow-y-auto px-5 py-4">
            {section === "profile" &&
              (user ? (
                <ProfilePane key={user.id} user={user} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sign in to manage your profile.
                </p>
              ))}

            {section === "notifications" && (
              <div className="divide-y">
                <Row
                  label="Email updates"
                  hint="Receipts and important account messages"
                  control={
                    <Switch
                      checked={emailUpdates}
                      onCheckedChange={setEmailUpdates}
                    />
                  }
                />
                {isManager ? (
                  <Row
                    label="New application alerts"
                    hint="Notify me when someone applies to my listings"
                    control={
                      <Switch
                        checked={applicationAlerts}
                        onCheckedChange={setApplicationAlerts}
                      />
                    }
                  />
                ) : (
                  <Row
                    label="Rent reminders"
                    hint="Nudge me before rent is due"
                    control={
                      <Switch
                        checked={rentReminders}
                        onCheckedChange={setRentReminders}
                      />
                    }
                  />
                )}
                <Row
                  label="Product news"
                  hint="Occasional updates about new features"
                  control={
                    <Switch
                      checked={productNews}
                      onCheckedChange={setProductNews}
                    />
                  }
                />
                <p className="pt-3 text-xs text-muted-foreground">
                  Preferences are saved on this device.
                </p>
              </div>
            )}

            {section === "appearance" && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Theme</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "light", label: "Light", icon: SunIcon },
                    { id: "dark", label: "Dark", icon: MoonIcon },
                    { id: "system", label: "System", icon: MonitorIcon },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 text-xs font-medium transition-colors",
                        (theme ?? "system") === t.id
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                      )}
                    >
                      <t.icon className="size-4" />
                      {t.label}
                      {(theme ?? "system") === t.id && (
                        <CheckIcon className="size-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  System follows your device&apos;s light / dark setting.
                </p>
              </div>
            )}

            {section === "account" && (
              <div className="space-y-4">
                <div className="rounded-xl border p-4">
                  <p className="text-sm font-medium">Signed in as</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {user?.name} · {user?.email}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    <LogOutIcon className="size-4" />
                    {signingOut ? "Signing out…" : "Sign out"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Need to change your password or delete your account? Contact
                  support — self-service isn&apos;t available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
