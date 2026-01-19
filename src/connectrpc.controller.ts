import type {
  SayRequest,
  SayResponse,
  SayResponses,
} from 'gen/connectrpc/eliza/v1/eliza_pb';
import {
  ElizaService,
  SayResponseSchema,
  SayResponsesSchema,
} from 'gen/connectrpc/eliza/v1/eliza_pb';
import { create } from '@bufbuild/protobuf';
import { ConnectRPC, Service } from './connectrpc-fastify';
import { SkipAuthGuard } from './auth.guard';

export class ConnectrpcController implements Service<typeof ElizaService> {
  constructor() {
    ConnectRPC.registerController(this, ElizaService);
  }

  /**
   * Unary RPC: Say
   * Client sends one request, server sends one response
   *
   * For demonstration, this method is decorated with @SkipAuthGuard to bypass authentication.
   */
  @SkipAuthGuard()
  async say(request: SayRequest): Promise<SayResponse> {
    return create(SayResponseSchema, {
      sentence: `You said: ${request.sentence}`,
    });
  }

  /**
   * Client Streaming RPC: SayMany
   * Client sends multiple requests, server sends one response with all collected
   */
  async sayMany(request: AsyncIterable<SayRequest>): Promise<SayResponses> {
    const responses: SayResponse[] = [];

    for await (const req of request) {
      responses.push(
        create(SayResponseSchema, {
          sentence: `You said: ${req.sentence}`,
        }),
      );
    }

    return create(SayResponsesSchema, {
      responses,
    });
  }

  /**
   * Server Streaming RPC: ListenMany
   * Client sends one request, server sends multiple responses
   */
  async *listenMany(request: SayRequest): AsyncIterable<SayResponse> {
    const words = request.sentence.split(' ');

    for (const word of words) {
      // Simulate some processing delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      yield create(SayResponseSchema, {
        sentence: `Echo: ${word}`,
      });
    }
  }
}
