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

export function getStudioUrl(id?: string) {
  if (id) {
    return `/studio/${id}`;
  }

  return `/studio`;
}
export function getCourseUrl(id?: string) {
  if (id) {
    return `/courses/${id}`;
  }

  return `/courses`;
}
