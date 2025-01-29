import { renderHook, act } from "@testing-library/react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationStatus, NotificationType } from "@/types/notifications";

// Mock React scheduler
jest.mock("scheduler", () => require("scheduler/unstable_mock"));

// Set up React testing environment
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && (
      args[0].includes('enqueueTaskImpl') ||
      args[0].includes('Error fetching notifications')
    )) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock setTimeout
jest.mock("timers", () => ({
  setTimeout: jest.fn((cb) => {
    cb();
    return 123;
  }),
}));

// Mock EventSource
class MockEventSource {
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  close = jest.fn();

  constructor(public url: string) {}

  addEventListener(event: string, callback: any) {
    switch (event) {
      case "open":
        this.onopen = callback;
        break;
      case "message":
        this.onmessage = callback;
        break;
      case "error":
        this.onerror = callback;
        break;
    }
  }

  removeEventListener(event: string, callback: any) {
    switch (event) {
      case "open":
        this.onopen = null;
        break;
      case "message":
        this.onmessage = null;
        break;
      case "error":
        this.onerror = null;
        break;
    }
  }

  simulateOpen() {
    if (this.onopen) this.onopen();
  }

  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent("message", { data: JSON.stringify(data) }));
    }
  }

  simulateError() {
    if (this.onerror) {
      const error = new Event("error");
      Object.defineProperty(error, "target", { value: this });
      this.onerror(error);
    }
  }
}

const EventSourceMock = jest.fn().mockImplementation((url) => new MockEventSource(url));
(global as any).EventSource = EventSourceMock;

// Mock Response.json
const createMockResponse = (data: any) => {
  const response = new Response(JSON.stringify(data));
  Object.defineProperty(response, "json", {
    value: () => Promise.resolve(data),
    writable: true,
    configurable: true,
  });
  return response;
};

describe("useNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFetch.mockImplementation(() => 
      Promise.resolve(createMockResponse({ notifications: [] }))
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockNotifications = [
    {
      id: "1",
      type: NotificationType.SYSTEM,
      title: "Test Notification 1",
      message: "Test Message 1",
      status: NotificationStatus.UNREAD,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user1",
    },
    {
      id: "2",
      type: NotificationType.TEAM,
      title: "Test Notification 2",
      message: "Test Message 2",
      status: NotificationStatus.READ,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user1",
    },
  ];

  it("should fetch initial notifications", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(createMockResponse({ notifications: mockNotifications }))
    );

    const { result } = renderHook(() => useNotifications());

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);

    // Wait for fetch to complete
    await act(async () => {
      await Promise.resolve();
    });

    // Updated state
    expect(result.current.loading).toBe(false);
    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.unreadCount).toBe(1); // One unread notification
  });

  it("should handle SSE connection and messages", async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await Promise.resolve();
    });

    const eventSource = EventSourceMock.mock.results[0].value as MockEventSource;

    // Simulate connection open
    act(() => {
      eventSource.simulateOpen();
    });

    expect(result.current.connected).toBe(true);

    // Simulate receiving a new notification
    act(() => {
      eventSource.simulateMessage({
        type: "notifications",
        data: [mockNotifications[0]],
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });

  it("should handle SSE connection errors and retry", async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await Promise.resolve();
    });

    const eventSource = EventSourceMock.mock.results[0].value as MockEventSource;

    // Simulate error
    act(() => {
      eventSource.simulateError();
    });

    expect(result.current.connected).toBe(false);

    // Should attempt to reconnect after delay
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);

    // Fast-forward timer
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should create new EventSource
    expect(EventSourceMock).toHaveBeenCalledTimes(2);
  });

  it("should mark notification as read", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: mockNotifications }),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.markAsRead("1");
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/notifications/1/read", {
      method: "POST",
    });
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications[0].status).toBe(NotificationStatus.READ);
  });

  it("should archive notification", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: mockNotifications }),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.archiveNotification("1");
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/notifications/1/archive", {
      method: "POST",
    });
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications[0].status).toBe(
      NotificationStatus.ARCHIVED
    );
  });

  it("should restore notification", async () => {
    const archivedNotification = {
      ...mockNotifications[0],
      status: NotificationStatus.ARCHIVED,
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: [archivedNotification] }),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.restoreNotification("1");
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/notifications/1/restore", {
      method: "POST",
    });
    expect(result.current.notifications[0].status).toBe(NotificationStatus.READ);
  });

  it("should clean up SSE connection on unmount", () => {
    const { unmount } = renderHook(() => useNotifications());
    const eventSource = EventSourceMock.mock.results[0].value as MockEventSource;
    
    unmount();

    expect(eventSource.close).toHaveBeenCalled();
  });
}); 