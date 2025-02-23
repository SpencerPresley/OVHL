// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NextResponse } from 'next/server';

import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { GET, POST } from '@/app/api/notifications/route';
import { mockPrismaClient } from '@/mocks/prisma';
import { NotificationStatus, NotificationType } from '@/types/notifications';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrismaClient,
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => {
  const NextResponseClass = {
    json: jest.fn().mockImplementation((data, init) => {
      const response = new Response(JSON.stringify(data), init);
      Object.defineProperty(response, 'json', {
        value: async () => data,
        writable: true,
        configurable: true,
      });
      return response;
    }),
  };
  return {
    NextResponse: NextResponseClass,
  };
});

// Mock Response constructor
const originalResponse = global.Response;
global.Response = jest.fn().mockImplementation((body, init) => {
  const response = new originalResponse(body, init);
  Object.defineProperty(response, 'json', {
    value: async () => JSON.parse(await response.text()),
    writable: true,
    configurable: true,
  });
  return response;
}) as unknown as typeof Response;

// Mock Request constructor
const originalRequest = global.Request;
global.Request = jest.fn().mockImplementation((url, init) => {
  const request = new originalRequest(url, init);
  return request;
}) as unknown as typeof Request;

describe('Notifications API Routes', () => {
  const mockUserId = 'user123';
  const mockNotifications = [
    {
      id: '1',
      userId: mockUserId,
      type: NotificationType.SYSTEM,
      title: 'Test Notification',
      message: 'Test Message',
      status: NotificationStatus.UNREAD,
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaClient.notification.findMany.mockResolvedValue(mockNotifications);
    mockPrismaClient.notification.create.mockImplementation(async (args) => ({
      ...args.data,
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    (verify as jest.Mock).mockReturnValue({ id: mockUserId, isAdmin: true });
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: 'valid.token' }),
    });
  });

  describe('GET /api/notifications', () => {
    it("should return user's notifications", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notifications).toEqual(mockNotifications);
      expect(mockPrismaClient.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should handle database errors', async () => {
      mockPrismaClient.notification.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch notifications' });
    });
  });

  describe('POST /api/notifications', () => {
    const mockNotification = {
      userId: mockUserId,
      type: NotificationType.SYSTEM,
      title: 'Test Notification',
      message: 'Test Message',
      status: NotificationStatus.UNREAD,
    };

    it('should create a new notification for admin users', async () => {
      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockNotification),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notification).toMatchObject(mockNotification);
      expect(mockPrismaClient.notification.create).toHaveBeenCalledWith({
        data: mockNotification,
      });
    });

    it('should handle database errors', async () => {
      mockPrismaClient.notification.create.mockRejectedValue(new Error('Database error'));

      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockNotification),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create notification' });
    });
  });
});
