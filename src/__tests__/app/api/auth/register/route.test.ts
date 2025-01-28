import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { POST } from '@/app/api/auth/register/route'
import 'jest-fetch-mock'

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockFindFirst = jest.fn()
  const mockCreate = jest.fn()
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findFirst: mockFindFirst,
        create: mockCreate,
      },
    })),
    __mockFindFirst: mockFindFirst,
    __mockCreate: mockCreate,
  }
})

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      ...data,
      status: init?.status,
    })),
  },
}))

describe('Register API Route', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword123',
  }

  let mockFindFirst: jest.Mock
  let mockCreate: jest.Mock

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Get reference to mocked functions
    mockFindFirst = require('@prisma/client').__mockFindFirst
    mockCreate = require('@prisma/client').__mockCreate
  })

  describe('Input Validation', () => {
    it('returns 400 when email is missing', async () => {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', password: 'password123' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'Email, username and password are required',
        })
      )
    })

    it('returns 400 when username is missing', async () => {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'Email, username and password are required',
        })
      )
    })

    it('returns 400 when password is missing', async () => {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', username: 'testuser' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'Email, username and password are required',
        })
      )
    })
  })

  describe('User Existence Check', () => {
    it('returns 400 when user with email already exists', async () => {
      mockFindFirst.mockResolvedValueOnce(mockUser)

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'newuser',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'User already exists',
        })
      )
    })

    it('returns 400 when user with username already exists', async () => {
      mockFindFirst.mockResolvedValueOnce(mockUser)

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'new@example.com',
          username: 'testuser',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'User already exists',
        })
      )
    })
  })

  describe('User Creation', () => {
    it('successfully creates a new user', async () => {
      mockFindFirst.mockResolvedValueOnce(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword123')
      mockCreate.mockResolvedValueOnce(mockUser)

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBeUndefined()
      expect(response).toEqual(
        expect.objectContaining({
          user: {
            id: mockUser.id,
            email: mockUser.email,
            username: mockUser.username,
          },
        })
      )

      // Verify bcrypt was called correctly
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
    })

    it('returns 500 on database error during user creation', async () => {
      mockFindFirst.mockResolvedValueOnce(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword123')
      mockCreate.mockRejectedValueOnce(new Error('Database error'))

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'Internal server error',
        })
      )
    })

    it('returns 500 on bcrypt error', async () => {
      mockFindFirst.mockResolvedValueOnce(null)
      ;(bcrypt.hash as jest.Mock).mockRejectedValueOnce(new Error('Bcrypt error'))

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'Internal server error',
        })
      )
    })
  })
}) 