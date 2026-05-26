import { mapApiPortfolioItemToSource } from '@/lib/hooks/use-artisan-portfolio-adapter'

describe('mapApiPortfolioItemToSource', () => {
  it('maps a public featured item', () => {
    const item = {
      id: 'p1', title: 'Kitchen remodel', description: 'Full redesign',
      imageUrl: 'https://img.example.com/1.jpg', imageUrls: [],
      category: 'Carpentry', tags: ['wood', 'cabinets'],
      completedAt: null, duration: '3 days', cost: 45000,
      isPublic: true, isFeatured: true, createdAt: '', updatedAt: '',
    }
    const result = mapApiPortfolioItemToSource(item)
    expect(result.id).toBe('p1')
    expect(result.title).toBe('Kitchen remodel')
    expect(result.status).toBe('Published')
    expect(result.featured).toBe(true)
    expect(result.cost).toBe('KES 45,000')
    expect(result.category).toBe('Carpentry')
    expect(result.description).toBe('Full redesign')
  })

  it('maps a private item to Draft status', () => {
    const item = {
      id: 'p2', title: 'Draft project', description: null,
      imageUrl: '', imageUrls: [], category: null, tags: [],
      completedAt: null, duration: null, cost: null,
      isPublic: false, isFeatured: false, createdAt: '', updatedAt: '',
    }
    const result = mapApiPortfolioItemToSource(item)
    expect(result.status).toBe('Draft')
    expect(result.category).toBe('Uncategorized')
    expect(result.cost).toBe('')
    expect(result.description).toBe('')
  })

  it('assigns correct gradient for Plumbing category', () => {
    const item = {
      id: 'p3', title: 'Pipe work', description: null, imageUrl: '', imageUrls: [],
      category: 'Plumbing', tags: [], completedAt: null, duration: null, cost: null,
      isPublic: true, isFeatured: false, createdAt: '', updatedAt: '',
    }
    const result = mapApiPortfolioItemToSource(item)
    expect(result.gradient).toContain('dbeafe')
  })

  it('uses default gradient for unknown category', () => {
    const item = {
      id: 'p4', title: 'T', description: null, imageUrl: '', imageUrls: [],
      category: 'Tailoring', tags: [], completedAt: null, duration: null, cost: null,
      isPublic: true, isFeatured: false, createdAt: '', updatedAt: '',
    }
    const result = mapApiPortfolioItemToSource(item)
    expect(result.gradient).toContain('ecfdf5')
  })

  it('preserves tags array', () => {
    const item = {
      id: 'p5', title: 'T', description: null, imageUrl: '', imageUrls: [],
      category: null, tags: ['modern', 'oak'], completedAt: null, duration: null,
      cost: null, isPublic: true, isFeatured: false, createdAt: '', updatedAt: '',
    }
    expect(mapApiPortfolioItemToSource(item).tags).toEqual(['modern', 'oak'])
  })
})
