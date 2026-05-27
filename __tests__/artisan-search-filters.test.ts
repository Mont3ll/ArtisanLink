import { describe, it, expect } from 'vitest'

function matchesVerified(artisan: { isVerified: boolean }, verifiedOnly: boolean): boolean {
  return !verifiedOnly || artisan.isVerified
}

function matchesAvailability(artisan: { isAvailable: boolean }, availableOnly: boolean): boolean {
  return !availableOnly || artisan.isAvailable
}

function matchesQuery(artisan: { name: string; profession: string }, query: string): boolean {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  return artisan.name.toLowerCase().includes(q) || artisan.profession.toLowerCase().includes(q)
}

describe('browse directory filter logic', () => {
  describe('matchesVerified', () => {
    it('passes all when verifiedOnly is false', () => {
      expect(matchesVerified({ isVerified: false }, false)).toBe(true)
      expect(matchesVerified({ isVerified: true }, false)).toBe(true)
    })
    it('filters unverified when verifiedOnly is true', () => {
      expect(matchesVerified({ isVerified: false }, true)).toBe(false)
    })
    it('passes verified artisans when verifiedOnly is true', () => {
      expect(matchesVerified({ isVerified: true }, true)).toBe(true)
    })
  })
  describe('matchesAvailability', () => {
    it('passes all when availableOnly is false', () => {
      expect(matchesAvailability({ isAvailable: false }, false)).toBe(true)
    })
    it('filters unavailable when availableOnly is true', () => {
      expect(matchesAvailability({ isAvailable: false }, true)).toBe(false)
      expect(matchesAvailability({ isAvailable: true }, true)).toBe(true)
    })
  })
  describe('matchesQuery', () => {
    it('passes all when query is empty', () => {
      expect(matchesQuery({ name: 'Grace', profession: 'Carpenter' }, '')).toBe(true)
    })
    it('matches by name', () => {
      expect(matchesQuery({ name: 'Grace Wanjiku', profession: 'Carpenter' }, 'grace')).toBe(true)
    })
    it('matches by profession', () => {
      expect(matchesQuery({ name: 'Grace', profession: 'Carpenter' }, 'carpen')).toBe(true)
    })
    it('rejects non-matching query', () => {
      expect(matchesQuery({ name: 'Grace', profession: 'Carpenter' }, 'plumber')).toBe(false)
    })
  })
  describe('combined filters', () => {
    it('verified AND available filters applied together', () => {
      const artisan = { isVerified: true, isAvailable: false, name: 'A', profession: 'B' }
      const passes = matchesVerified(artisan, true) && matchesAvailability(artisan, true)
      expect(passes).toBe(false)
    })
    it('no filters passes everything', () => {
      const artisan = { isVerified: false, isAvailable: false, name: 'A', profession: 'B' }
      expect(matchesVerified(artisan, false) && matchesAvailability(artisan, false)).toBe(true)
    })
  })
})
