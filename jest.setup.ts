import '@testing-library/jest-dom'
import { enableFetchMocks } from 'jest-fetch-mock'
import { loadEnvConfig } from '@next/env'
import { mockPrismaClient } from '@/mocks/prisma'

// Load test environment variables
loadEnvConfig(process.cwd(), true, { info: () => null, error: console.error });

// Set up TextEncoder/TextDecoder
global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder as typeof global.TextDecoder

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrismaClient,
}))

// Apply browser-specific mocks only in jsdom environment
if (typeof window !== 'undefined') {
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Mock EventSource for SSE tests
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

(global as any).EventSource = MockEventSource;

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => null),
  usePathname: jest.fn(),
}));

// Mock Headers
Object.defineProperty(global, "Headers", {
  configurable: true,
  writable: true,
  value: Headers,
});

enableFetchMocks()

// Mock Request and Response
Object.defineProperty(globalThis, 'Request', {
  writable: true,
  value: Request,
})

Object.defineProperty(globalThis, 'Response', {
  writable: true,
  value: Response,
})

// Mock fetch for Node.js environment
require('cross-fetch/polyfill'); 