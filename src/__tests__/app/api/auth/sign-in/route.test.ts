import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { POST } from '@/app/api/auth/sign-in/route'
import 'jest-fetch-mock'

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockFindUnique = jest.fn()
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: mockFindUnique,
      },
    })),
    __mockFindUnique: mockFindUnique, // Export for tests to use
  }
})

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      ...data,
      status: init?.status,
      cookies: {
        set: jest.fn(),
      },
    })),
  },
}))

describe('Sign In API Route', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    isAdmin: false,
  }

  let mockFindUnique: jest.Mock

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Get reference to mocked findUnique
    mockFindUnique = require('@prisma/client').__mockFindUnique
    
    // Mock environment variables
    process.env = {
      ...process.env,
      JWT_SECRET: 'test-secret',
      NODE_ENV: 'test',
    }
  })

  describe('Input Validation', () => {
    it('returns 400 when email is missing', async () => {
      const request = new Request('http://localhost/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ password: 'password123' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'Email and password are required',
        })
      )
    })

    it('returns 400 when password is missing', async () => {
      const request = new Request('http://localhost/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'Email and password are required',
        })
      )
    })
  })

  describe('User Lookup', () => {
    it('returns 401 when user does not exist', async () => {
      mockFindUnique.mockResolvedValueOnce(null)

      const request = new Request('http://localhost/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email: 'nonexistent@example.com', password: 'password123' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'Invalid credentials',
        })
      )
    })
  })

  describe('Password Verification', () => {
    it('returns 401 when password is invalid', async () => {
      mockFindUnique.mockResolvedValueOnce(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(false)

      const request = new Request('http://localhost/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'Invalid credentials',
        })
      )
    })

    it('succeeds when credentials are valid', async () => {
      mockFindUnique.mockResolvedValueOnce(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(true)
      ;(sign as jest.Mock).mockReturnValueOnce('mock.jwt.token')

      const request = new Request('http://localhost/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'password123',
          rememberMe: false 
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
            isAdmin: mockUser.isAdmin,
          },
        })
      )
    })
  })

  describe('JWT and Cookie Handling', () => {
    it('sets correct cookie options for non-remembered session', async () => {
      mockFindUnique.mockResolvedValueOnce(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(true)
      ;(sign as jest.Mock).mockReturnValueOnce('mock.jwt.token')

      const request = new Request('http://localhost/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'password123',
          rememberMe: false 
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.cookies.set).toHaveBeenCalledWith({
        name: 'token',
        value: 'mock.jwt.token',
        httpOnly: true,
        secure: false, // because NODE_ENV is 'test'
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      })
    })

    it('sets correct cookie options for remembered session', async () => {
      mockFindUnique.mockResolvedValueOnce(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(true)
      ;(sign as jest.Mock).mockReturnValueOnce('mock.jwt.token')

      const request = new Request('http://localhost/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'password123',
          rememberMe: true 
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.cookies.set).toHaveBeenCalledWith({
        name: 'token',
        value: 'mock.jwt.token',
        httpOnly: true,
        secure: false, // because NODE_ENV is 'test'
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      })
    })
  })

  describe('Error Handling', () => {
    it('returns 500 on database error', async () => {
      mockFindUnique.mockRejectedValueOnce(new Error('Database error'))

      const request = new Request('http://localhost/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'An error occurred while signing in',
        })
      )
    })

    it('returns 500 on JWT signing error', async () => {
      mockFindUnique.mockResolvedValueOnce(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(true)
      ;(sign as jest.Mock).mockImplementationOnce(() => {
        throw new Error('JWT signing error')
      })

      const request = new Request('http://localhost/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
      expect(response).toEqual(
        expect.objectContaining({
          error: 'An error occurred while signing in',
        })
      )
    })
  })
}) 