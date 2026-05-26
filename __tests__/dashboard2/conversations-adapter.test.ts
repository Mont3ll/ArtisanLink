import {
  mapConversationToThread,
  getContactName,
  mapConversationStatus,
} from '@/lib/hooks/use-conversations-adapter'
import type { Conversation } from '@/lib/hooks/use-conversations'

const makeConversation = (overrides: Partial<Conversation> = {}): Conversation => ({
  id: 'conv-1',
  clientId: 'client-1',
  artisanId: 'artisan-1',
  status: 'ACTIVE',
  subject: 'Sink repair',
  createdAt: '2026-05-26T10:00:00Z',
  updatedAt: '2026-05-26T10:00:00Z',
  lastMessageAt: '2026-05-26T10:30:00Z',
  client: { id: 'client-1', firstName: 'Jane', lastName: 'Doe', profile: { profileImage: null } },
  artisan: { id: 'artisan-1', firstName: 'Grace', lastName: 'Wanjiku',
    profile: { profileImage: null, profession: 'Plumber' } },
  lastMessage: { id: 'msg-1', content: 'I can start tomorrow',
    createdAt: '2026-05-26T10:30:00Z', senderId: 'artisan-1', status: 'DELIVERED' },
  ...overrides,
})

describe('mapConversationStatus', () => {
  it('maps ACTIVE → ACTIVE', () => expect(mapConversationStatus('ACTIVE')).toBe('ACTIVE'))
  it('maps ARCHIVED → COMPLETED', () => expect(mapConversationStatus('ARCHIVED')).toBe('COMPLETED'))
  it('maps BLOCKED → REVIEW', () => expect(mapConversationStatus('BLOCKED')).toBe('REVIEW'))
})

describe('getContactName', () => {
  it('returns client name when user is artisan', () => {
    expect(getContactName(makeConversation(), 'artisan-1')).toBe('Jane Doe')
  })
  it('returns artisan name when user is client', () => {
    expect(getContactName(makeConversation(), 'client-1')).toBe('Grace Wanjiku')
  })
  it('returns artisan name for unknown user id', () => {
    expect(getContactName(makeConversation(), 'unknown-id')).toBe('Grace Wanjiku')
  })
})

describe('mapConversationToThread', () => {
  it('uses subject as title', () => {
    const thread = mapConversationToThread(makeConversation(), 'artisan-1')
    expect(thread.title).toBe('Sink repair')
  })
  it('falls back to contact name when no subject', () => {
    const thread = mapConversationToThread(makeConversation({ subject: null }), 'artisan-1')
    expect(thread.title).toBe('Jane Doe') // client name from artisan perspective
  })
  it('maps conversation id to thread id', () => {
    const thread = mapConversationToThread(makeConversation(), 'artisan-1')
    expect(thread.id).toBe('conv-1')
    expect(thread.conversationId).toBe('conv-1')
  })
  it('sets artisan and client name fields', () => {
    const thread = mapConversationToThread(makeConversation(), 'artisan-1')
    expect(thread.artisan).toBe('Grace Wanjiku')
    expect(thread.client).toBe('Jane Doe')
  })
  it('maps ARCHIVED status to COMPLETED', () => {
    const thread = mapConversationToThread(makeConversation({ status: 'ARCHIVED' }), 'artisan-1')
    expect(thread.status).toBe('COMPLETED')
  })
  it('sets lastMessage as description', () => {
    const thread = mapConversationToThread(makeConversation(), 'artisan-1')
    expect(thread.description).toBe('I can start tomorrow')
  })
  it('sets description to fallback when no last message', () => {
    const thread = mapConversationToThread(makeConversation({ lastMessage: null }), 'artisan-1')
    expect(thread.description).toBe('No messages yet')
  })
})
