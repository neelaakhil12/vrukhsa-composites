import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Prepends the API base URL to a relative image path if it starts with /uploads
 * @param path The image path from the server
 * @returns The full URL to the image
 */
export function getImageUrl(path: string | undefined | null) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Get API_BASE_URL from import.meta.env to avoid circular dependency with client.ts if possible,
  // or just hardcode the logic if it's consistent.
  // Actually, client.ts exports API_BASE_URL.
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // Remove trailing slash from baseUrl and leading slash from path if necessary
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
}
