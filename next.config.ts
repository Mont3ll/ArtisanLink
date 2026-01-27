import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    // Allow images from these remote domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      // Production CDN for ArtisanLink images
      {
        protocol: 'https',
        hostname: 'images.artisanlink.co.ke',
        pathname: '/**',
      },
      // Add your production CDN/storage domain here
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
    ],
    // Image optimization settings
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL (in seconds)
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  // Security headers
  async headers() {
    return [
      {
        // Apply headers to all routes
        source: '/:path*',
        headers: [
          {
            // Prevent clickjacking attacks
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Prevent MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Control referrer information
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Enable browser XSS protection (legacy browsers)
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // DNS prefetch control
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            // Strict Transport Security (HTTPS only)
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            // Permissions policy (formerly Feature-Policy)
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
        ],
      },
      {
        // Apply stricter CSP to API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },

  // Compress responses
  compress: true,

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      'lucide-react',
      '@clerk/nextjs',
      'gsap',
    ],
  },
};

export default nextConfig;
