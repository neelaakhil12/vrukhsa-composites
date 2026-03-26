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
  
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Clean the path (remove leading slash if present to avoid doubles)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If it already starts with 'uploads/', don't double it
  const finalPath = cleanPath.startsWith('uploads') ? cleanPath : `uploads/${cleanPath}`;

  if (envUrl) {
    const cleanBase = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    return `${cleanBase}/${finalPath}`;
  }
  
  // Absolute relative path for browser
  return `/${finalPath}`;
}
