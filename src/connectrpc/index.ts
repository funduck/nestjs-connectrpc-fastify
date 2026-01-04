// Export main module
export { ConnectrpcModule } from './connectrpc.module';

// Export decorators
export { Controller } from './decorators';

// Export interface for type-safe service implementation
export type { Service } from './interfaces';

// Export configuration interfaces and helpers
export type { ModuleOptions, MiddlewareConfig } from './interfaces';
export { middleware } from './interfaces';

// Export metadata stores
export { MiddlewareStore } from './metadata';
