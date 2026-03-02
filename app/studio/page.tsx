"use client";

import { useGetProfileQuery } from "@/modules/user/use-get-profile-query";
import { useBecomeCreatorMutation } from "@/modules/user/use-become-creator-mutation";
import { Button } from "@/components/ui/button";

function BecomeCreatorBanner() {
  const becomeCreatorMutation = useBecomeCreatorMutation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-semibold mb-2">Become a Creator</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Unlock the studio to create and craft your own courses. Join our
        community of creators and share your knowledge with the world.
      </p>
      <Button
        onClick={() => becomeCreatorMutation.mutate()}
        disabled={becomeCreatorMutation.isPending}
        size="lg"
      >
        {becomeCreatorMutation.isPending
          ? "Becoming a Creator..."
          : "Become a Creator"}
      </Button>
      {becomeCreatorMutation.error && (
        <p className="text-red-500 mt-4">
          {becomeCreatorMutation.error.message}
        </p>
      )}
    </div>
  );
}

function CreatorStudio() {
  const { data: profile } = useGetProfileQuery();

  return (
    <div>
      <p className="text-gray-600">
        Welcome to the studio, {profile?.name || "Creator"}!
      </p>
    </div>
  );
}

export default function StudioPage() {
  const { data: profile, isLoading } = useGetProfileQuery();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const isCreator = profile?.roles?.includes("creator");

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Studio</h1>
      {!isCreator ? <BecomeCreatorBanner /> : <CreatorStudio />}
    </div>
  );
}
