/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import InviteDemoTokenPage from '../app/invite/demo-token/page'

vi.mock('@/components/dashboard2/admin/source-admin-preview', () => ({
  default: ({ initialRoute }: { initialRoute: string }) => (
    <div data-testid="source-preview" data-route={initialRoute} />
  ),
}))

describe('InviteDemoTokenPage', () => {
  it('renders without error', () => {
    render(<InviteDemoTokenPage />)
    expect(screen.getByTestId('source-preview')).toBeInTheDocument()
  })
  it('passes correct invite route', () => {
    render(<InviteDemoTokenPage />)
    const el = screen.getByTestId('source-preview')
    expect(el.getAttribute('data-route')).toContain('invite=demo-token')
    expect(el.getAttribute('data-route')).toContain('role=artisan')
  })
})
