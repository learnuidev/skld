"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "@aws-amplify/auth";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="my-4 flex justify-between items-center">
      <Link href="/" className="font-bold uppercase">
        skld
      </Link>

      <div className="hidden md:flex gap-8 items-center">
        <Link className="font-light" href="/dashboard">
          dashboard
        </Link>

        <Link className="font-light" href="/studio">
          studio
        </Link>

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
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden flex flex-col gap-4 p-4">
          <Link className="font-light" href="/dashboard" onClick={() => setIsOpen(false)}>
            dashboard
          </Link>

          <Link className="font-light" href="/studio" onClick={() => setIsOpen(false)}>
            studio
          </Link>

          <Link className="font-light" href="/profile" onClick={() => setIsOpen(false)}>
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
