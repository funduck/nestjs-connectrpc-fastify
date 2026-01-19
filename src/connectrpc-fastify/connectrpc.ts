import { ControllersStore, GuardsStore, MiddlewareStore } from './stores';
import { GenService } from '@bufbuild/protobuf/codegenv2';
import { FastifyInstance } from 'fastify';
import { registerFastifyPlugin } from './fastify-plugin';
import { setLogger } from './helpers';
import { Logger, Middleware, MiddlewareConfig } from './interfaces';
import { initMiddlewares } from './middlewares';
import { initGuards } from './guards';

interface Guard {
  canActivate(context: any): boolean | Promise<boolean>;
}

class ConnectRPCClass {
  setLogger(customLogger: Logger) {
    setLogger(customLogger);
  }

  registerMiddleware(
    self: Middleware,
    options?: {
      allowMultipleInstances?: boolean;
    },
  ) {
    MiddlewareStore.registerInstance(self, options);
  }

  registerController(
    self: any,
    service: GenService<any>,
    options?: {
      allowMultipleInstances?: boolean;
    },
  ) {
    ControllersStore.registerInstance(self, service, options);
  }

  registerGuard(
    self: Guard,
    options?: {
      allowMultipleInstances?: boolean;
    },
  ) {
    GuardsStore.registerInstance(self, options);
  }

  registerFastifyPlugin(server: FastifyInstance) {
    return registerFastifyPlugin(server);
  }

  initMiddlewares(
    server: FastifyInstance,
    middlewareConfigs: MiddlewareConfig[],
  ) {
    return initMiddlewares(server, middlewareConfigs);
  }

  initGuards(server: FastifyInstance) {
    return initGuards(server);
  }
}

/**
 * Main ConnectRPC class to manage registration of controllers and middlewares
 */
export const ConnectRPC = new ConnectRPCClass();
