import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDashboardUrl(id?: string) {
  if (id) {
    return `/dashboard?courseId=${id}`;
  }

  return `/dashboard`;
}
