"use client";

import { useGetProfileQuery } from "@/modules/user/use-get-profile-query";
import { BecomeCreatorBanner } from "./components/become-creator-banner";
import { CreatorStudio } from "./components/creator-studio";

export default function StudioPage() {
  const { data: profile, isLoading } = useGetProfileQuery();

  if (isLoading) {
    return <div className="py-8">Loading...</div>;
  }

  const isCreator = profile?.roles?.includes("creator");

  return <div>{!isCreator ? <BecomeCreatorBanner /> : <CreatorStudio />}</div>;
}
