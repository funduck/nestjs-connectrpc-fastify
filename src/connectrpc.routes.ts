import type { ConnectRouter, HandlerContext } from '@connectrpc/connect';
import { ElizaService, SayRequest } from 'gen/connectrpc/eliza/v1/eliza_pb';

export const connectRpcRoutes = (router: ConnectRouter) => {
  // registers connectrpc.eliza.v1.ElizaService
  router.service(ElizaService, {
    // implements rpc Say
    async say(req: SayRequest, context: HandlerContext) {
      return {
        sentence: `You said: ${req.sentence}`,
      };
    },
  });

  console.log('ConnectRPC routes registered');
};
