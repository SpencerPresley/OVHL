import { http, HttpResponse } from 'msw'

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
] 