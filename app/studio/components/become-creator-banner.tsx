"use client";

import { Button } from "@/components/ui/button";
import { useBecomeCreatorMutation } from "@/modules/user/use-become-creator-mutation";

export function BecomeCreatorBanner() {
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
