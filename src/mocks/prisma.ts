import { NotificationStatus, NotificationType } from '@/types/notifications';

export const mockNotifications = [
  {
    id: '1',
    userId: 'user123',
    type: NotificationType.SYSTEM,
    title: 'Test Notification',
    message: 'Test Message',
    link: null,
    metadata: {},
    status: NotificationStatus.UNREAD,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockPrismaClient = {
  notification: {
    findMany: jest.fn().mockResolvedValue(mockNotifications),
    create: jest.fn().mockImplementation((args) =>
      Promise.resolve({
        ...args.data,
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
    update: jest.fn().mockImplementation((args) =>
      Promise.resolve({
        ...mockNotifications[0],
        ...args.data,
        updatedAt: new Date(),
      })
    ),
    delete: jest.fn().mockResolvedValue(mockNotifications[0]),
    findUnique: jest
      .fn()
      .mockImplementation((args) =>
        Promise.resolve(mockNotifications.find((n) => n.id === args.where.id))
      ),
    findFirst: jest.fn().mockResolvedValue(mockNotifications[0]),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((args) =>
      Promise.resolve({
        ...args.data,
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
    update: jest.fn().mockImplementation((args) =>
      Promise.resolve({
        id: '1',
        ...args.data,
        updatedAt: new Date(),
      })
    ),
  },
  // Add other models as needed
};
