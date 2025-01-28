import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { GET } from "@/app/api/auth/user/route";
import "jest-fetch-mock";

// Mock dependencies
jest.mock("@prisma/client", () => {
  const mockFindUnique = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: mockFindUnique,
      },
    })),
    __mockFindUnique: mockFindUnique, // Export for tests to use
  };
});

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => ({
      ...body,
      status: init?.status,
      json: async () => body,
    })),
  },
}));

// Mock cookies
const mockGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}));

describe("User API Route", () => {
  const mockUser = {
    id: "123",
    email: "test@example.com",
    isAdmin: false,
  };

  let mockFindUnique: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Get reference to mocked findUnique
    mockFindUnique = require("@prisma/client").__mockFindUnique;
    
    // Mock environment variables
    process.env = {
      ...process.env,
      JWT_SECRET: "test-secret",
    };
  });

  describe("Authentication Validation", () => {
    it("returns 401 when no token is present", async () => {
      mockGet.mockReturnValueOnce(null);

      const response = await GET();
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: "Not authenticated",
      });
    });

    it("returns 401 when token verification fails", async () => {
      mockGet.mockReturnValueOnce({ value: "invalid-token" });
      (verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const response = await GET();
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: "Authentication failed",
      });
    });

    it("returns 401 when token is malformed", async () => {
      mockGet.mockReturnValueOnce({ value: "malformed-token" });
      (verify as jest.Mock).mockImplementationOnce(() => ({
        // Missing required fields
        foo: "bar",
      }));

      const response = await GET();
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: "Authentication failed",
      });
    });
  });

  describe("User Lookup", () => {
    it("returns 404 when user is not found", async () => {
      mockGet.mockReturnValueOnce({ value: "valid-token" });
      (verify as jest.Mock).mockReturnValueOnce({
        id: "123",
        email: "test@example.com",
      });
      mockFindUnique.mockResolvedValueOnce(null);

      const response = await GET();
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        error: "User not found",
      });
    });

    it("returns user data when token and user are valid", async () => {
      mockGet.mockReturnValueOnce({ value: "valid-token" });
      (verify as jest.Mock).mockReturnValueOnce({
        id: "123",
        email: "test@example.com",
      });
      mockFindUnique.mockResolvedValueOnce(mockUser);

      const response = await GET();
      expect(await response.json()).toEqual({
        user: mockUser,
      });
    });

    it("returns 401 on database error", async () => {
      mockGet.mockReturnValueOnce({ value: "valid-token" });
      (verify as jest.Mock).mockReturnValueOnce({
        id: "123",
        email: "test@example.com",
      });
      mockFindUnique.mockRejectedValueOnce(new Error("Database error"));

      const response = await GET();
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: "Authentication failed",
      });
    });
  });

  describe("Response Format", () => {
    it("returns only selected user fields", async () => {
      mockGet.mockReturnValueOnce({ value: "valid-token" });
      (verify as jest.Mock).mockReturnValueOnce({
        id: "123",
        email: "test@example.com",
      });
      
      // Mock the database to return only the selected fields
      mockFindUnique.mockResolvedValueOnce({
        id: mockUser.id,
        email: mockUser.email,
        isAdmin: mockUser.isAdmin,
      });

      const response = await GET();
      const data = await response.json();
      
      // Should only contain id, email, and isAdmin
      expect(Object.keys(data.user)).toHaveLength(3);
      expect(data.user).toEqual(mockUser);
      expect(data.user).not.toHaveProperty("password");
      expect(data.user).not.toHaveProperty("createdAt");
      expect(data.user).not.toHaveProperty("updatedAt");
    });
  });
}); 