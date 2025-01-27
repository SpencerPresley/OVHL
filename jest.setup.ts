import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util'
import { server } from '@/mocks/server'
import { enableFetchMocks } from 'jest-fetch-mock'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

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

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => server.close())

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

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

// Mock Headers
Object.defineProperty(globalThis, 'Headers', {
  writable: true,
  value: Headers,
}) 