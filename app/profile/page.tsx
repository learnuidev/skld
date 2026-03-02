"use client";

import { useState } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Mail,
  User as UserIcon,
  Shield,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useGetProfileQuery } from "@/modules/user/use-get-profile-query";
import { useUpdateProfileMutation } from "@/modules/user/use-update-profile-mutation";

export default function ProfilePage() {
  const { setTheme } = useTheme();
  const { data: profile, isLoading } = useGetProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const handleSaveName = async () => {
    await updateProfileMutation.mutateAsync({ name: nameInput });
    setIsEditingName(false);
  };

  const handleCancelName = () => {
    setNameInput(profile?.name || "");
    setIsEditingName(false);
  };

  const handleNameClick = () => {
    setNameInput(profile?.name || "");
    setIsEditingName(true);
  };

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
              <div
                className="flex items-center gap-3 py-4 cursor-pointer hover:bg-muted/50 transition-colors -mx-2 px-2"
                onClick={!isEditingName ? handleNameClick : undefined}
              >
                <UserIcon className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Name</div>
                  {isEditingName ? (
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="text-sm font-medium w-full bg-transparent border-b border-border focus:outline-none focus:border-primary"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : !isLoading ? (
                    profile?.name ? (
                      <div className="text-sm font-medium">{profile.name}</div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <AlertTriangle className="size-4 text-orange-500" />
                        <span>Name not set</span>
                      </div>
                    )
                  ) : (
                    <div className="text-sm font-medium">Loading...</div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-b">
              <div className="flex items-center gap-3 py-4">
                <Mail className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="text-sm font-medium">
                    {isLoading
                      ? "Loading..."
                      : profile?.email || "Not available"}
                  </div>
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

          {isEditingName && (
            <div className="mt-12 bg-background">
              <div className="flex gap-2 justify-end items-end">
                <Button
                  onClick={handleSaveName}
                  disabled={updateProfileMutation.isPending}
                >
                  <Check className="size-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving" : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelName}
                  disabled={updateProfileMutation.isPending}
                >
                  <X className="size-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
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
