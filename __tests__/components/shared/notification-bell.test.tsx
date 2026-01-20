import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from '@/components/shared/notification-bell';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

// Sample notifications data factory
const createMockNotificationsResponse = (overrides = {}) => ({
  items: [
    {
      id: '1',
      type: 'MESSAGE' as const,
      title: 'New message from John',
      message: 'Hey, I wanted to discuss the project...',
      data: null,
      linkUrl: '/messages/1',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      readAt: null,
    },
    {
      id: '2',
      type: 'REVIEW' as const,
      title: 'New 5-star review',
      message: 'A client left you a great review!',
      data: null,
      linkUrl: '/reviews',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      readAt: null,
    },
    {
      id: '3',
      type: 'VERIFICATION' as const,
      title: 'Account verified',
      message: 'Your account has been verified successfully.',
      data: null,
      linkUrl: null,
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 3,
    totalPages: 1,
  },
  unreadCount: 2,
  ...overrides,
});

const createEmptyNotificationsResponse = () => ({
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  unreadCount: 0,
});

describe('NotificationBell', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial rendering', () => {
    it('renders the bell button', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('fetches notifications on mount', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/notifications?limit=10');
      });
    });

    it('shows unread count badge when there are unread notifications', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('does not show badge when no unread notifications', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createEmptyNotificationsResponse()),
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('shows 99+ when unread count exceeds 99', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse({ unreadCount: 150 })),
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByText('99+')).toBeInTheDocument();
      });
    });
  });

  describe('Dropdown behavior', () => {
    it('opens dropdown when bell button is clicked', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });
    });

    it('shows notification items in dropdown', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('New message from John')).toBeInTheDocument();
      });
      
      expect(screen.getByText('New 5-star review')).toBeInTheDocument();
      expect(screen.getByText('Account verified')).toBeInTheDocument();
    });

    it('shows empty state when no notifications', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createEmptyNotificationsResponse()),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('No notifications yet')).toBeInTheDocument();
      });
    });

    it('shows "View all notifications" link', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });

      const viewAllLink = screen.getByText('View all notifications');
      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink.closest('a')).toHaveAttribute('href', '/notifications');
    });
  });

  describe('Mark all as read', () => {
    it('shows "Mark all read" button when there are unread notifications', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Mark all read')).toBeInTheDocument();
      });
    });

    it('does not show "Mark all read" when no unread notifications', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse({ unreadCount: 0 })),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
    });

    it('calls API to mark all as read', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Mark all read')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Mark all read'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/notifications/read-all', {
          method: 'POST',
        });
      });
    });
  });

  describe('Mark individual notification as read', () => {
    it('renders unread notifications with correct state', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('New message from John')).toBeInTheDocument();
      });

      // Verify unread notification has the font-medium class (indicating unread state)
      const unreadNotification = screen.getByText('New message from John');
      expect(unreadNotification).toHaveClass('font-medium');
      
      // Verify the notification has a link
      const notificationLink = unreadNotification.closest('a');
      expect(notificationLink).toHaveAttribute('href', '/messages/1');
    });

    it('shows unread badge count that reflects number of unread notifications', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);
      
      // Badge shows 2 unread notifications
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });

  describe('Notification types', () => {
    it('renders notifications with various types', async () => {
      const user = userEvent.setup();
      
      const allTypesResponse = {
        items: [
          { id: '1', type: 'MESSAGE', title: 'Message notification', message: 'Test', data: null, linkUrl: null, isRead: false, createdAt: new Date().toISOString(), readAt: null },
          { id: '2', type: 'REVIEW', title: 'Review notification', message: 'Test', data: null, linkUrl: null, isRead: false, createdAt: new Date().toISOString(), readAt: null },
          { id: '3', type: 'VERIFICATION', title: 'Verification notification', message: 'Test', data: null, linkUrl: null, isRead: false, createdAt: new Date().toISOString(), readAt: null },
          { id: '4', type: 'SYSTEM', title: 'System notification', message: 'Test', data: null, linkUrl: null, isRead: false, createdAt: new Date().toISOString(), readAt: null },
          { id: '5', type: 'PROMOTION', title: 'Promotion notification', message: 'Test', data: null, linkUrl: null, isRead: false, createdAt: new Date().toISOString(), readAt: null },
          { id: '6', type: 'BOOKING', title: 'Booking notification', message: 'Test', data: null, linkUrl: null, isRead: false, createdAt: new Date().toISOString(), readAt: null },
        ],
        pagination: { page: 1, limit: 10, total: 6, totalPages: 1 },
        unreadCount: 6,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(allTypesResponse),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Message notification')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Review notification')).toBeInTheDocument();
      expect(screen.getByText('Verification notification')).toBeInTheDocument();
      expect(screen.getByText('System notification')).toBeInTheDocument();
      expect(screen.getByText('Promotion notification')).toBeInTheDocument();
      expect(screen.getByText('Booking notification')).toBeInTheDocument();
    });
  });

  describe('Time formatting', () => {
    it('shows "Just now" for very recent notifications', async () => {
      const user = userEvent.setup();
      
      const recentResponse = {
        items: [{
          id: '1',
          type: 'MESSAGE',
          title: 'Recent notification',
          message: 'Test',
          data: null,
          linkUrl: null,
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 1000).toISOString(),
          readAt: null,
        }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        unreadCount: 1,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(recentResponse),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Just now')).toBeInTheDocument();
      });
    });

    it('shows minutes ago for recent notifications', async () => {
      const user = userEvent.setup();
      
      const minutesAgoResponse = {
        items: [{
          id: '1',
          type: 'MESSAGE',
          title: 'Minutes ago notification',
          message: 'Test',
          data: null,
          linkUrl: null,
          isRead: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          readAt: null,
        }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        unreadCount: 1,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(minutesAgoResponse),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('15m ago')).toBeInTheDocument();
      });
    });

    it('shows hours ago for older notifications', async () => {
      const user = userEvent.setup();
      
      const hoursAgoResponse = {
        items: [{
          id: '1',
          type: 'MESSAGE',
          title: 'Hours ago notification',
          message: 'Test',
          data: null,
          linkUrl: null,
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          readAt: null,
        }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        unreadCount: 1,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(hoursAgoResponse),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('5h ago')).toBeInTheDocument();
      });
    });

    it('shows days ago for notifications from days ago', async () => {
      const user = userEvent.setup();
      
      const daysAgoResponse = {
        items: [{
          id: '1',
          type: 'MESSAGE',
          title: 'Days ago notification',
          message: 'Test',
          data: null,
          linkUrl: null,
          isRead: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          readAt: null,
        }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        unreadCount: 1,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(daysAgoResponse),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('3d ago')).toBeInTheDocument();
      });
    });
  });

  describe('Notification links', () => {
    it('renders notification with link as anchor', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('New message from John')).toBeInTheDocument();
      });

      const messageLink = screen.getByText('New message from John').closest('a');
      expect(messageLink).toHaveAttribute('href', '/messages/1');
    });

    it('renders notification without link as div', async () => {
      const user = userEvent.setup();
      
      const noLinkResponse = {
        items: [{
          id: '1',
          type: 'MESSAGE',
          title: 'No link notification',
          message: 'Test',
          data: null,
          linkUrl: null,
          isRead: false,
          createdAt: new Date().toISOString(),
          readAt: null,
        }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        unreadCount: 1,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(noLinkResponse),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('No link notification')).toBeInTheDocument();
      });

      const notification = screen.getByText('No link notification');
      expect(notification.closest('a')).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('handles fetch error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<NotificationBell />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching notifications:',
          expect.any(Error)
        );
      });

      expect(screen.getByRole('button')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('handles non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Visual styling', () => {
    it('applies unread styling to unread notifications', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockNotificationsResponse()),
      });

      render(<NotificationBell />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('New message from John')).toBeInTheDocument();
      });

      const unreadNotification = screen.getByText('New message from John');
      expect(unreadNotification).toHaveClass('font-medium');
    });
  });
});
