import { KENYAN_FIRST_NAMES, KENYAN_LAST_NAMES } from './data'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

export function randomDate(daysBack: number): Date {
  return new Date(Date.now() - randomInt(0, daysBack) * 24 * 60 * 60 * 1000)
}

export function generatePhone(): string {
  const prefixes = ['0700', '0701', '0702', '0703', '0704', '0705', '0710', '0711', '0712', '0713',
                    '0714', '0715', '0716', '0717', '0718', '0719', '0720', '0721', '0722', '0723',
                    '0724', '0725', '0726', '0727', '0728', '0729', '0740', '0741', '0742', '0743',
                    '0745', '0746', '0748', '0757', '0758', '0759', '0768', '0769', '0790', '0791',
                    '0792', '0793', '0794', '0795', '0796', '0797', '0798', '0799']
  return `+254${randomElement(prefixes).slice(1)}${randomInt(100000, 999999)}`
}

export function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com']
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${randomInt(1, 99)}`,
  ]
  return `${randomElement(formats)}@${randomElement(domains)}`
}

export function addCoordinateJitter(lat: number, lng: number, jitter = 0.1): { lat: number; lng: number } {
  return {
    lat: lat + randomFloat(-jitter, jitter, 4),
    lng: lng + randomFloat(-jitter, jitter, 4),
  }
}

export function generateKenyanName(): { firstName: string; lastName: string; isFemale: boolean } {
  const isFemale = Math.random() > 0.5
  const firstName = randomElement(isFemale ? KENYAN_FIRST_NAMES.female : KENYAN_FIRST_NAMES.male)
  const lastName = randomElement(KENYAN_LAST_NAMES)
  return { firstName, lastName, isFemale }
}

// Helper to process items in batches
export async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>,
  delayMs = 100
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)
    
    // Small delay between batches to avoid overwhelming the connection
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  return results
}

// Logger utility
export function log(emoji: string, message: string): void {
  console.log(`${emoji} ${message}`)
}

export function logSuccess(message: string, count?: number): void {
  const countStr = count !== undefined ? ` (${count})` : ''
  console.log(`✅ ${message}${countStr}`)
}

export function logError(message: string, error?: unknown): void {
  console.error(`❌ ${message}`)
  if (error) {
    console.error(error)
  }
}

export function logSection(title: string): void {
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`${title}`)
  console.log(`${'─'.repeat(50)}`)
}
