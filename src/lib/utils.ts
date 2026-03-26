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
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // Clean the path (remove leading slash)
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If the path doesn't start with 'uploads/', assume it might be in the public root (like nature-fiber images)
  // But if it is meant to be an upload, ensure it has the prefix for the static route
  
  // Special case: if it's a known legacy path that doesn't exist in uploads, don't force uploads/
  const isLegacy = cleanPath.startsWith('nature-fiber images') || cleanPath.startsWith('assets');
  if (!isLegacy && !cleanPath.startsWith('uploads')) {
      cleanPath = `uploads/${cleanPath}`;
  }

  // Use the origin directly for static assets, bypassing any /api suffix in VITE_API_URL
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/${cleanPath}`;
  }
  
  return `/${cleanPath}`;
}
