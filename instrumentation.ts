/**
 * Next.js Instrumentation
 * 
 * This file runs once when the server starts, before any requests are handled.
 * Used to set up global configurations that need to happen early.
 */

export async function register() {
  // Only run on server (Node.js runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Force Node.js to prefer IPv4 over IPv6
    // This fixes connectivity issues with Cloudinary and other services
    // on networks where IPv6 is unreachable or blocked
    const dns = await import('dns')
    dns.setDefaultResultOrder('ipv4first')
    
    console.log('[instrumentation] DNS configured to prefer IPv4')
  }
}
