import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Allowed image hostnames (must match next.config.ts remotePatterns)
const ALLOWED_IMAGE_HOSTS = [
  'images.unsplash.com',
  'res.cloudinary.com',
  'lh3.googleusercontent.com',
  'img.clerk.com',
  'avatars.githubusercontent.com',
]

/**
 * Check if a URL is from an allowed image host configured in next.config.ts
 * Use this to validate URLs before passing them to next/image component
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    const parsedUrl = new URL(url)
    return ALLOWED_IMAGE_HOSTS.some(host => 
      parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.supabase.co')
    )
  } catch {
    return false
  }
}
