import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { POST } from '@/app/api/auth/reset-password/route';
import 'jest-fetch-mock';

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockFindFirst = jest.fn();
  const mockUpdate = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findFirst: mockFindFirst,
        update: mockUpdate,
      },
    })),
    __mockFindFirst: mockFindFirst,
    __mockUpdate: mockUpdate,
  };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => ({
      ...body,
      status: init?.status,
      json: async () => body,
    })),
  },
}));

describe('Reset Password API Route', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    resetToken: 'valid-token',
    resetTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
  };

  let mockFindFirst: jest.Mock;
  let mockUpdate: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Get reference to mocked functions
    mockFindFirst = require('@prisma/client').__mockFindFirst;
    mockUpdate = require('@prisma/client').__mockUpdate;
  });

  describe('Input Validation', () => {
    it('returns 400 when token is missing', async () => {
      const request = new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: 'newpassword123' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Invalid or expired reset token',
      });
    });

    it('returns 400 when password is missing', async () => {
      const request = new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: 'valid-token' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Invalid or expired reset token',
      });
    });
  });

  describe('Token Verification', () => {
    it('returns 400 when token is invalid', async () => {
      mockFindFirst.mockResolvedValueOnce(null);

      const request = new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'invalid-token',
          password: 'newpassword123',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Invalid or expired reset token',
      });
    });

    it('returns 400 when token is expired', async () => {
      mockFindFirst.mockResolvedValueOnce({
        ...mockUser,
        resetTokenExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      });

      const request = new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'expired-token',
          password: 'newpassword123',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Invalid or expired reset token',
      });
    });
  });

  describe('Password Update', () => {
    it('successfully updates password with valid token', async () => {
      mockFindFirst.mockResolvedValueOnce(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_new_password');
      mockUpdate.mockResolvedValueOnce({ ...mockUser, password: 'hashed_new_password' });

      const request = new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'valid-token',
          password: 'newpassword123',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBeUndefined();
      expect(await response.json()).toEqual({
        message: 'Password reset successful',
      });

      // Verify password was hashed
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);

      // Verify user was updated correctly
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          password: 'hashed_new_password',
          resetToken: null,
          resetTokenExpiresAt: null,
        },
      });
    });

    it('returns 500 on database error during update', async () => {
      mockFindFirst.mockResolvedValueOnce(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_new_password');
      mockUpdate.mockRejectedValueOnce(new Error('Database error'));

      const request = new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'valid-token',
          password: 'newpassword123',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: 'Failed to reset password',
      });
    });
  });

  describe('Error Handling', () => {
    it('returns 500 on bcrypt error', async () => {
      mockFindFirst.mockResolvedValueOnce(mockUser);
      (bcrypt.hash as jest.Mock).mockRejectedValueOnce(new Error('Bcrypt error'));

      const request = new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'valid-token',
          password: 'newpassword123',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: 'Failed to reset password',
      });
    });

    it('returns 500 on JSON parsing error', async () => {
      const request = new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid-json',
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: 'Failed to reset password',
      });
    });
  });
});
