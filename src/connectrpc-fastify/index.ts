export type { Logger } from './interfaces';

// Export interface for type-safe service implementation
export type { Service } from './interfaces';

// Export configuration interfaces and helpers
export type { MiddlewareConfig } from './interfaces';
export { middleware } from './interfaces';

// Export main ConnectRPC module
export { ConnectRPC } from './connectrpc';

// Export guards initialization
export { initGuards } from './guards';
