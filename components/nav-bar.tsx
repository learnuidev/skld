"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCourseUrl, getDashboardUrl, getStudioUrl } from "@/lib/utils";
import { signOut } from "@aws-amplify/auth";
import { Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SkldLogo } from "./skld-logo";

const contentPathRegex = /courses\/[A-Z0-9]+\/contents\/[A-Z0-9]+/;

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const pathName = usePathname();
  const searchParams = useSearchParams();
  const searchParamsCourseId = searchParams.get("courseId") || "";
  const params = useParams<{ courseId?: string }>();
  const containsKnowledgeGraph = pathName.includes("knowledge-graph");
  const isContentPage = contentPathRegex.test(pathName);

  if (containsKnowledgeGraph || isContentPage) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const courseId = params.courseId || searchParamsCourseId;

  const dashboardUrl = getDashboardUrl(courseId);
  const studioUrl = getStudioUrl(courseId);
  const courseUrl = getCourseUrl(courseId);

  return (
    <nav className="my-0 sm:my-4 flex justify-between items-center sm:mb-12 mb-0">
      <Link href="/" className="font-bold">
        <SkldLogo className="size-10" />
      </Link>

      <div className="hidden md:flex gap-8 items-center">
        <Link className="font-light" href={dashboardUrl}>
          dashboard
        </Link>

        <Link className="font-light" href={courseUrl}>
          courses
        </Link>

        <Link className="font-light" href={studioUrl}>
          studio
        </Link>
      </div>

      <div className="hidden md:flex gap-8 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} variant="destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-4 md:hidden">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden flex flex-col gap-4 p-4">
          <Link
            className="font-light"
            href="/dashboard"
            onClick={() => setIsOpen(false)}
          >
            dashboard
          </Link>

          <Link
            className="font-light"
            href={courseUrl}
            onClick={() => setIsOpen(false)}
          >
            courses
          </Link>

          <Link
            className="font-light"
            href={studioUrl}
            onClick={() => setIsOpen(false)}
          >
            studio
          </Link>
          <Link
            className="font-light"
            href={dashboardUrl}
            onClick={() => setIsOpen(false)}
          >
            dashboard
          </Link>

          <Link
            className="font-light"
            href="/profile"
            onClick={() => setIsOpen(false)}
          >
            profile
          </Link>

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
