import type {
  SayRequest,
  SayResponse,
  SayResponses,
} from 'gen/connectrpc/eliza/v1/eliza_pb';
import { ElizaService } from 'gen/connectrpc/eliza/v1/eliza_pb';
import { ConnectRPC, Service } from './connectrpc-fastify';
import { SkipAuthGuard } from './auth.guard';
import { OmitConnectrpcFields } from './connectrpc-fastify/types';

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
  async say(
    request: SayRequest,

    // You can leave out the return type, it will be inferred from the interface
  ) {
    return {
      sentence: `You said: ${request.sentence}`,
    };
  }

  /**
   * Client Streaming RPC: SayMany
   * Client sends multiple requests, server sends one response with all collected
   */
  async sayMany(
    request: AsyncIterable<SayRequest>,

    // You can specify the return type if you want, but you always need to use OmitConnectrpcFields<> because ConnectRPC adds extra fields internally
  ): Promise<OmitConnectrpcFields<SayResponses>> {
    const responses: OmitConnectrpcFields<SayResponse>[] = [];

    for await (const req of request) {
      responses.push({
        sentence: `You said: ${req.sentence}`,
      });
    }

    return {
      responses,
    };
  }

  /**
   * Server Streaming RPC: ListenMany
   * Client sends one request, server sends multiple responses
   */
  async *listenMany(request: SayRequest) {
    const words = request.sentence.split(' ');

    for (const word of words) {
      // Simulate some processing delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      yield {
        sentence: `Echo: ${word}`,
      };
    }
  }
}
