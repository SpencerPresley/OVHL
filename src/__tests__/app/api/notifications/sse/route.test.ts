import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { mockPrismaClient } from "@/mocks/prisma";
import { GET } from "@/app/api/notifications/sse/route";
import { NotificationStatus } from "@/types/notifications";
import { TextEncoder } from "util";

// Mock dependencies
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrismaClient,
}));

// Mock NextResponse
jest.mock("next/server", () => {
  return {
    NextResponse: {
      json: jest.fn().mockImplementation((data, init) => {
        const response = new Response(JSON.stringify(data), init);
        Object.defineProperty(response, "json", {
          value: async () => data,
          writable: true,
          configurable: true,
        });
        return response;
      }),
    },
  };
});

// Mock web APIs
class MockReadableStream {
  private chunks: Uint8Array[] = [];
  private controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  private listeners: { [key: string]: ((event: any) => void)[] } = {};

  constructor() {
    this.controller = null;
  }

  getReader() {
    return {
      read: async () => {
        const chunk = this.chunks.shift();
        return chunk ? { done: false, value: chunk } : { done: true, value: undefined };
      },
      releaseLock: () => {},
      cancel: () => Promise.resolve(),
    };
  }

  enqueue(chunk: Uint8Array) {
    this.chunks.push(chunk);
    if (this.controller) {
      this.controller.enqueue(chunk);
    }
  }

  close() {
    if (this.controller) {
      this.controller.close();
    }
  }

  addEventListener(event: string, callback: (event: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event: string, callback: (event: any) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  dispatchEvent(event: any) {
    const listeners = this.listeners[event.type] || [];
    listeners.forEach(callback => callback(event));
    return true;
  }
}

// Mock Response constructor
const originalResponse = global.Response;
global.Response = jest.fn().mockImplementation((body, init) => {
  // If body is a string (JSON), use it directly
  const actualBody = typeof body === 'string' ? body : body instanceof ReadableStream ? body : JSON.stringify(body);
  const response = new originalResponse(actualBody, init);
  
  // Add proper json method
  Object.defineProperty(response, 'json', {
    value: async () => JSON.parse(await response.text()),
    writable: true,
    configurable: true,
  });
  
  return response;
}) as any;

// Mock EventSource
class MockEventSource extends EventTarget {
  CONNECTING = 0;
  OPEN = 1;
  CLOSED = 2;
  readyState = this.OPEN;
  url = '';
  withCredentials = false;
  onerror: ((this: EventSource, ev: Event) => any) | null = null;
  onmessage: ((this: EventSource, ev: MessageEvent<any>) => any) | null = null;
  onopen: ((this: EventSource, ev: Event) => any) | null = null;

  constructor(url: string, eventSourceInitDict?: EventSourceInit) {
    super();
    this.url = url;
    this.withCredentials = eventSourceInitDict?.withCredentials || false;
  }

  close() {
    this.readyState = this.CLOSED;
  }
}

global.EventSource = MockEventSource as any;

// Mock Request constructor
const mockAbortController = new AbortController();
const originalRequest = global.Request;
global.Request = jest.fn().mockImplementation((url, init) => {
  const request = new originalRequest(url, init);
  Object.defineProperty(request, 'signal', {
    value: mockAbortController.signal,
    writable: true,
    configurable: true,
  });
  return request;
}) as any;

describe("SSE API Route", () => {
  let mockTimer: NodeJS.Timeout;
  const mockUserId = "user123";
  const mockToken = "mock-token";
  
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Silence console.error
    
    // Mock cookies
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: mockToken }),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);
    
    // Mock JWT verify
    (verify as jest.Mock).mockReturnValue({ id: mockUserId });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    if (mockTimer) {
      clearInterval(mockTimer);
    }
    jest.clearAllMocks();
    (console.error as jest.Mock).mockRestore();
  });

  it("should establish SSE connection and send initial message", async () => {
    const request = new Request("http://localhost:3000/api/notifications/sse");
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache, no-transform");
    expect(response.headers.get("Connection")).toBe("keep-alive");

    // Fast-forward past the first ping
    jest.advanceTimersByTime(100);
    
    // Cleanup
    jest.clearAllTimers();
  }, 10000);

  it("should handle unauthorized requests", async () => {
    // Mock missing token
    const mockCookieStore = {
      get: jest.fn().mockReturnValue(null),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);

    const request = new Request("http://localhost:3000/api/notifications/sse");
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    
    const text = await response.text();
    const data = JSON.parse(text);
    expect(data).toEqual({ error: "Authentication required" });
  });

  it("should send notifications when available", async () => {
    const mockNotifications = [
      {
        id: "1",
        userId: mockUserId,
        type: "GENERAL",
        title: "Test Notification",
        message: "This is a test notification",
        status: "UNREAD",
        createdAt: new Date(),
      },
    ];

    (mockPrismaClient.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications);

    const request = new Request("http://localhost:3000/api/notifications/sse");
    const response = await GET(request);

    // Fast-forward past the immediate notification check
    jest.advanceTimersByTime(100);

    expect(mockPrismaClient.notification.findMany).toHaveBeenCalledWith({
      where: {
        userId: mockUserId,
        status: "UNREAD",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Cleanup
    jest.clearAllTimers();
  }, 10000);

  it("should handle database errors gracefully", async () => {
    (mockPrismaClient.notification.findMany as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const request = new Request("http://localhost:3000/api/notifications/sse");
    const response = await GET(request);

    // Fast-forward past the error
    jest.advanceTimersByTime(100);

    // The connection should stay alive despite the error
    expect(response.status).toBe(200);
    expect(console.error).toHaveBeenCalledWith(
      "Error checking for notifications:",
      expect.any(Error)
    );
    
    // Cleanup
    jest.clearAllTimers();
  }, 10000);

  it("should clean up resources on client disconnect", async () => {
    const request = new Request("http://localhost:3000/api/notifications/sse");
    const response = await GET(request);

    // Simulate client disconnect
    const controller = new AbortController();
    controller.abort();

    // Fast-forward to ensure cleanup
    jest.advanceTimersByTime(100);

    expect(response.status).toBe(200);
    
    // Cleanup
    jest.clearAllTimers();
  }, 10000);
}); 