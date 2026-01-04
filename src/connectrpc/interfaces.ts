import { NestMiddleware, Type } from '@nestjs/common';
import type { GenMessage, GenService } from '@bufbuild/protobuf/codegenv2';
import { Compression } from '@connectrpc/connect/protocol';

/**
 * Extract the input type from a method schema
 */
type ExtractInput<T> = T extends { input: GenMessage<infer M> } ? M : never;

/**
 * Extract the output type from a method schema
 */
type ExtractOutput<T> = T extends { output: GenMessage<infer M> } ? M : never;

/**
 * Convert a service method to a controller method signature
 */
type ServiceMethod<T> = T extends { methodKind: 'unary' }
  ? (request: ExtractInput<T>) => Promise<ExtractOutput<T>>
  : T extends { methodKind: 'server_streaming' }
    ? (request: ExtractInput<T>) => AsyncIterable<ExtractOutput<T>>
    : T extends { methodKind: 'client_streaming' }
      ? (request: AsyncIterable<ExtractInput<T>>) => Promise<ExtractOutput<T>>
      : T extends { methodKind: 'bidi_streaming' }
        ? (
            request: AsyncIterable<ExtractInput<T>>,
          ) => AsyncIterable<ExtractOutput<T>>
        : never;

/**
 * Generic interface that maps a ConnectRPC service to controller methods
 *
 * Controllers can implement any subset of the service methods.
 * TypeScript will enforce correct signatures for implemented methods.
 *
 * Usage:
 * ```typescript
 * @Controller({ service: ElizaService })
 * export class ElizaController implements ConnectRPCService<typeof ElizaService> {
 *   async say(request: SayRequest): Promise<SayResponse> {
 *     // implementation
 *   }
 *   // Other methods are optional
 * }
 * ```
 */
export type Service<T> =
  T extends GenService<infer Methods>
    ? {
        [K in keyof Methods]?: ServiceMethod<Methods[K]>;
      }
    : never;

export type ServiceMethodNames<T> =
  T extends GenService<infer Methods>
    ? {
        [K in keyof Methods]: K;
      }[keyof Methods]
    : never;

/**
 * Middleware configuration for ConnectRPC routes - without service specified
 */
export type MiddlewareConfigGlobal = {
  /**
   * The middleware class to apply (must be decorated with @Middleware())
   */
  use: Type<NestMiddleware>;

  /**
   * Middleware applies to all services and all methods
   */
  on?: never;
  methods?: never;
};

/**
 * Middleware configuration for ConnectRPC routes - with service specified
 */
export type MiddlewareConfigForService<T extends GenService<any>> = {
  /**
   * The middleware class to apply (must be decorated with @Middleware())
   */
  use: Type<NestMiddleware>;

  /**
   * The service to apply middleware to
   */
  on: T;

  /**
   * Optional: Specific method names to apply middleware to.
   * If omitted, middleware applies to all methods of the service.
   * Method names should match the protobuf method names (e.g., 'say', 'sayMany')
   */
  methods?: Array<ServiceMethodNames<T>>;
};

/**
 * Middleware configuration for ConnectRPC routes
 */
export type MiddlewareConfig =
  | MiddlewareConfigGlobal
  | MiddlewareConfigForService<any>;

/**
 * Helper function to create a type-safe middleware configuration
 * This ensures proper type inference for method names based on the service
 */
export function middleware<T extends GenService<any>>(
  use: Type<NestMiddleware>,
  on?: T,
  methods?: Array<ServiceMethodNames<T>>,
): MiddlewareConfig {
  return {
    use,
    on,
    methods,
  };
}

/**
 * Options for configuring ConnectRPC module
 */
export interface ModuleOptions {
  /**
   * Middleware configurations to apply to ConnectRPC routes
   */
  middlewares?: MiddlewareConfig[];

  // For now we enable only Connect protocol by default and disable others.
  // /**
  //  * Whether to enable gRPC protocol (default: false)
  //  */
  // grpc?: boolean;

  // /**
  //  * Whether to enable gRPC-Web protocol (default: false)
  //  */
  // grpcWeb?: boolean;

  // /**
  //  * Whether to enable Connect protocol (default: true)
  //  */
  // connect?: boolean;

  /**
   * Compression formats to accept (default: [])
   */
  acceptCompression?: Compression[];
}
