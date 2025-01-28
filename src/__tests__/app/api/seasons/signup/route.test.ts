import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { POST } from "@/app/api/seasons/signup/route";

// Mock dependencies
jest.mock("@prisma/client", () => {
  const mockFindFirst = jest.fn();
  const mockFindUnique = jest.fn();
  const mockCreate = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      season: {
        findFirst: mockFindFirst,
      },
      player: {
        findUnique: mockFindUnique,
      },
      playerSeason: {
        findFirst: mockFindFirst,
        create: mockCreate,
      },
    })),
    __mockFindFirst: mockFindFirst,
    __mockFindUnique: mockFindUnique,
    __mockCreate: mockCreate,
  };
});

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

// Mock cookies
const mockGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => ({
      ...body,
      status: init?.status,
    })),
  },
}));

describe("Season Signup API Route", () => {
  const mockToken = "valid.jwt.token";
  const mockUser = {
    userId: "user1",
    email: "test@example.com",
  };
  const mockSeason = {
    id: "season1",
    isLatest: true,
  };
  const mockPlayer = {
    id: "user1",
    email: "test@example.com",
  };

  let mockFindFirst: jest.Mock;
  let mockFindUnique: jest.Mock;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Get reference to mocked functions
    mockFindFirst = require("@prisma/client").__mockFindFirst;
    mockFindUnique = require("@prisma/client").__mockFindUnique;
    mockCreate = require("@prisma/client").__mockCreate;

    // Setup default mock implementations
    mockGet.mockReturnValue({ value: mockToken });
    (verify as jest.Mock).mockReturnValue(mockUser);
    process.env.JWT_SECRET = "test-secret";
  });

  describe("Authentication", () => {
    it("returns 401 when no token is present", async () => {
      mockGet.mockReturnValue(null);

      const response = await POST(new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          seasonId: "season1",
          position: "forward",
        }),
      }));

      expect(response.status).toBe(401);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Not authenticated",
        })
      );
    });

    it("returns 500 when token verification fails", async () => {
      (verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const response = await POST(new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          seasonId: "season1",
          position: "forward",
        }),
      }));

      expect(response.status).toBe(500);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Failed to sign up for season",
        })
      );
    });
  });

  describe("Input Validation", () => {
    it("returns 400 when seasonId is missing", async () => {
      const response = await POST(new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          position: "forward",
        }),
      }));

      expect(response.status).toBe(400);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Season ID and position are required",
        })
      );
    });

    it("returns 400 when position is missing", async () => {
      const response = await POST(new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          seasonId: "season1",
        }),
      }));

      expect(response.status).toBe(400);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Season ID and position are required",
        })
      );
    });
  });

  describe("Season Validation", () => {
    it("returns 400 when season does not exist", async () => {
      mockFindFirst.mockResolvedValueOnce(null); // season.findFirst

      const response = await POST(new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          seasonId: "invalid-season",
          position: "forward",
        }),
      }));

      expect(response.status).toBe(400);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Invalid or inactive season",
        })
      );
    });

    it("returns 400 when season is not latest", async () => {
      // Mock findFirst to return null when checking for latest season
      mockFindFirst.mockResolvedValueOnce(null); // season.findFirst returns null for non-latest season

      const response = await POST(new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          seasonId: "old-season",
          position: "forward",
        }),
      }));

      expect(response.status).toBe(400);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Invalid or inactive season",
        })
      );
    });
  });

  describe("Player Validation", () => {
    it("returns 400 when player record not found", async () => {
      mockFindFirst.mockResolvedValueOnce(mockSeason); // season.findFirst
      mockFindUnique.mockResolvedValueOnce(null); // player.findUnique

      const response = await POST(new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          seasonId: "season1",
          position: "forward",
        }),
      }));

      expect(response.status).toBe(400);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Player record not found",
        })
      );
    });

    it("returns 400 when player already signed up for season", async () => {
      mockFindFirst
        .mockResolvedValueOnce(mockSeason) // season.findFirst
        .mockResolvedValueOnce({ // playerSeason.findFirst
          id: "existing-signup",
          playerId: mockPlayer.id,
          seasonId: mockSeason.id,
        });
      mockFindUnique.mockResolvedValueOnce(mockPlayer); // player.findUnique

      const response = await POST(new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          seasonId: "season1",
          position: "forward",
        }),
      }));

      expect(response.status).toBe(400);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Already signed up for this season",
        })
      );
    });
  });

  describe("Successful Signup", () => {
    it("creates player season record and returns success", async () => {
      mockFindFirst
        .mockResolvedValueOnce(mockSeason) // season.findFirst
        .mockResolvedValueOnce(null); // playerSeason.findFirst (no existing signup)
      mockFindUnique.mockResolvedValueOnce(mockPlayer); // player.findUnique
      mockCreate.mockResolvedValueOnce({
        id: "new-signup",
        playerId: mockPlayer.id,
        seasonId: mockSeason.id,
        position: "forward",
      });

      const response = await POST(new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          seasonId: "season1",
          position: "forward",
        }),
      }));

      expect(response.status).toBeUndefined();
      expect(response).toEqual(
        expect.objectContaining({
          message: "Successfully signed up for season",
        })
      );

      // Verify player season was created with correct data
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          playerId: mockPlayer.id,
          seasonId: mockSeason.id,
          position: "forward",
        },
      });
    });
  });

  describe("Error Handling", () => {
    it("returns 500 on database error", async () => {
      mockFindFirst.mockRejectedValueOnce(new Error("Database error"));

      const response = await POST(new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          seasonId: "season1",
          position: "forward",
        }),
      }));

      expect(response.status).toBe(500);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Failed to sign up for season",
        })
      );
    });

    it("returns 500 on unexpected error", async () => {
      mockFindFirst
        .mockResolvedValueOnce(mockSeason) // season.findFirst
        .mockResolvedValueOnce(null); // playerSeason.findFirst
      mockFindUnique.mockResolvedValueOnce(mockPlayer); // player.findUnique
      mockCreate.mockRejectedValueOnce(new Error("Unexpected error"));

      const response = await POST(new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          seasonId: "season1",
          position: "forward",
        }),
      }));

      expect(response.status).toBe(500);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Failed to sign up for season",
        })
      );
    });
  });
}); 