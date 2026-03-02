"use client";

import {
  Moon,
  Sun,
  Monitor,
  Mail,
  User as UserIcon,
  Shield,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const { setTheme } = useTheme();

  return (
    <div className="mx-auto py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-light tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings
        </p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList variant="line" className="justify-start px-0">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="ui-settings">UI Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-8">
          <div className="space-y-1">
            <div className="border-b">
              <div className="flex items-center gap-3 py-4">
                <UserIcon className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="text-sm font-medium">John Doe</div>
                </div>
              </div>
            </div>

            <div className="border-b">
              <div className="flex items-center gap-3 py-4">
                <Mail className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="text-sm font-medium">john@example.com</div>
                </div>
              </div>
            </div>

            <div className="border-b">
              <div className="flex items-center gap-3 py-4">
                <Shield className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">
                    Account Status
                  </div>
                  <div className="text-sm font-medium">Active</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ui-settings" className="mt-8">
          <div className="space-y-1">
            <div className="border-b">
              <div className="py-4">
                <div className="text-sm font-medium mb-3">Theme</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme("light")}
                    className="flex-1 border border-border/50 hover:border-border transition-colors py-3 px-4 text-sm text-left rounded-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="size-4" />
                      <span>Light</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className="flex-1 border border-border/50 hover:border-border transition-colors py-3 px-4 text-sm text-left rounded-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="size-4" />
                      <span>Dark</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className="flex-1 border border-border/50 hover:border-border transition-colors py-3 px-4 text-sm text-left rounded-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="size-4" />
                      <span>System</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
