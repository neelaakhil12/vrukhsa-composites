import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves image paths for the frontend.
 * Standardizes paths to work correctly across local development and production (Hostinger).
 * @param path The image path from the database (e.g., "/uploads/file.png")
 * @returns The full URL to the image
 */
export const getImageUrl = (path?: string | null) => {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path;
  
  // Clean the path to ensure it starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Browsers will resolve root-relative paths like "/uploads/..." 
  // correctly against the current origin (vrukshacomposites.com).
  return cleanPath;
};
