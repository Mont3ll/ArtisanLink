import { buildProfileCompletionPct, KENYAN_COUNTIES } from '@/lib/hooks/use-artisan-settings-adapter'

describe('buildProfileCompletionPct', () => {
  it('returns 50 for a completely empty profile', () => {
    expect(buildProfileCompletionPct({
      bio: null, profession: null, county: null, hourlyRate: null,
      certificateUrl: null, artisanStatus: null, portfolioCount: 0, specializationCount: 0,
    })).toBe(50)
  })

  it('adds 5 pts for bio', () => {
    expect(buildProfileCompletionPct({
      bio: 'I make things', profession: null, county: null, hourlyRate: null,
      certificateUrl: null, artisanStatus: null, portfolioCount: 0, specializationCount: 0,
    })).toBe(55)
  })

  it('adds 5 pts each for profession + county + rate without bio (65 total)', () => {
    expect(buildProfileCompletionPct({
      bio: null, profession: 'Carpenter', county: 'Nairobi',
      hourlyRate: 2600, certificateUrl: null, artisanStatus: null,
      portfolioCount: 0, specializationCount: 0,
    })).toBe(65)
  })

  it('adds 10 pts for certificateUrl', () => {
    expect(buildProfileCompletionPct({
      bio: null, profession: null, county: null, hourlyRate: null,
      certificateUrl: 'https://cert.example.com/1.pdf',
      artisanStatus: null, portfolioCount: 0, specializationCount: 0,
    })).toBe(60)
  })

  it('adds 10 pts for VERIFIED artisanStatus', () => {
    expect(buildProfileCompletionPct({
      bio: null, profession: null, county: null, hourlyRate: null,
      certificateUrl: null, artisanStatus: 'VERIFIED', portfolioCount: 0, specializationCount: 0,
    })).toBe(60)
  })

  it('adds 5 pts for 1 portfolio item, 10 for 2+', () => {
    expect(buildProfileCompletionPct({
      bio: null, profession: null, county: null, hourlyRate: null,
      certificateUrl: null, artisanStatus: null, portfolioCount: 1, specializationCount: 0,
    })).toBe(55)
    expect(buildProfileCompletionPct({
      bio: null, profession: null, county: null, hourlyRate: null,
      certificateUrl: null, artisanStatus: null, portfolioCount: 2, specializationCount: 0,
    })).toBe(60)
    expect(buildProfileCompletionPct({
      bio: null, profession: null, county: null, hourlyRate: null,
      certificateUrl: null, artisanStatus: null, portfolioCount: 5, specializationCount: 0,
    })).toBe(60)
  })

  it('adds 10 pts for at least 1 specialization', () => {
    expect(buildProfileCompletionPct({
      bio: null, profession: null, county: null, hourlyRate: null,
      certificateUrl: null, artisanStatus: null, portfolioCount: 0, specializationCount: 1,
    })).toBe(60)
  })

  it('caps at 100 for a fully complete profile', () => {
    expect(buildProfileCompletionPct({
      bio: 'Bio', profession: 'Carpenter', county: 'Nairobi',
      hourlyRate: 2600, certificateUrl: 'https://cert.example.com/1.pdf',
      artisanStatus: 'VERIFIED', portfolioCount: 3, specializationCount: 2,
    })).toBe(100)
  })
})

describe('KENYAN_COUNTIES', () => {
  it('has exactly 47 entries', () => {
    expect(KENYAN_COUNTIES.length).toBe(47)
  })

  it('contains Nairobi', () => {
    expect(KENYAN_COUNTIES).toContain('Nairobi')
  })

  it('contains Mombasa', () => {
    expect(KENYAN_COUNTIES).toContain('Mombasa')
  })

  it('contains West Pokot', () => {
    expect(KENYAN_COUNTIES).toContain('West Pokot')
  })

  it('all entries are non-empty strings', () => {
    for (const county of KENYAN_COUNTIES) {
      expect(typeof county).toBe('string')
      expect(county.length).toBeGreaterThan(0)
    }
  })
})
