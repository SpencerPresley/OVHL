import { handlers } from './handlers'

export const server = {
  listen: () => {},
  close: () => {},
  resetHandlers: () => {},
  use: (...handlers: any[]) => {},
} 