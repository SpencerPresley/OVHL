import { http, HttpResponse } from 'msw'

interface NotificationData {
  userId: string
  type: string
  title: string
  message: string
  link?: string | null
  metadata?: Record<string, any> | null
}

const mockNotifications = [
  {
    id: '1',
    userId: 'user1',
    type: 'info',
    title: 'Test Notification',
    message: 'This is a test notification',
    link: null,
    metadata: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/register', async () => {
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/auth/login', async () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'mock-jwt-token',
    })
  }),

  // League endpoints
  http.get('/api/leagues', async () => {
    return HttpResponse.json({
      leagues: [
        {
          id: '1',
          name: 'Test League',
          description: 'A test league',
          createdAt: new Date().toISOString(),
        },
      ],
    })
  }),

  // Team endpoints
  http.get('/api/teams', async () => {
    return HttpResponse.json({
      teams: [
        {
          id: '1',
          name: 'Test Team',
          leagueId: '1',
          createdAt: new Date().toISOString(),
        },
      ],
    })
  }),

  http.get('/api/notifications', () => {
    return HttpResponse.json({ notifications: mockNotifications })
  }),

  http.post('/api/notifications', async ({ request }) => {
    const data = await request.json() as NotificationData
    const notification = {
      ...data,
      id: '2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({ notification })
  }),

  http.get('/api/notifications/sse', () => {
    return new HttpResponse(null, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }),
] 