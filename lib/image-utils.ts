/**
 * Image utility helpers for optimized loading.
 *
 * Provides a shimmer blur placeholder (base64 SVG) used as the blurDataURL
 * for all Next.js <Image> components across the app.
 */

function toBase64(str: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(str).toString('base64')
  }
  return window.btoa(str)
}

function shimmerSvg(w: number, h: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#f2f2f2"/><stop offset="50%" stop-color="#e8e8e8"/><stop offset="100%" stop-color="#f2f2f2"/></linearGradient></defs><rect width="${w}" height="${h}" fill="#f2f2f2"/><rect width="${w}" height="${h}" fill="url(#g)" opacity="0.8"><animate attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"/></rect></svg>`
}

/** 4:3 aspect-ratio shimmer — artisan card hero images */
export const SHIMMER_4_3 = `data:image/svg+xml;base64,${toBase64(shimmerSvg(800, 600))}`

/** Square shimmer — artisan avatar thumbnails */
export const SHIMMER_SQUARE = `data:image/svg+xml;base64,${toBase64(shimmerSvg(80, 80))}`

/** 16:9 shimmer — portfolio modal / wide images */
export const SHIMMER_16_9 = `data:image/svg+xml;base64,${toBase64(shimmerSvg(800, 450))}`

/**
 * Standard `sizes` prop for artisan grid cards.
 * 1 column on mobile, 2 on tablet, 4 on desktop.
 */
export const ARTISAN_CARD_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 25vw'

/**
 * `sizes` prop for the artisan profile hero image.
 */
export const ARTISAN_PROFILE_AVATAR_SIZES = '80px'
