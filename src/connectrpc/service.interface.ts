import type { GenMessage, GenService } from '@bufbuild/protobuf/codegenv2';

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
