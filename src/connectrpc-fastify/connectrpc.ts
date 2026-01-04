import { NestMiddleware } from '@nestjs/common';
import { ControllersStore, MiddlewareStore } from './stores';
import { GenService } from '@bufbuild/protobuf/codegenv2';
import { FastifyInstance } from 'fastify';
import { registerFastifyPlugin } from './fastify-plugin';
import { setLogger } from './helpers';
import { Logger, MiddlewareConfig } from './interfaces';
import { initMiddlewares } from './middlewares';

class ConnectRPCClass {
  setLogger(customLogger: Logger) {
    setLogger(customLogger);
  }

  registerMiddleware(
    self: NestMiddleware,
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

  registerFastifyPlugin(server: FastifyInstance) {
    return registerFastifyPlugin(server);
  }

  initMiddlewares(
    server: FastifyInstance,
    middlewareConfigs: MiddlewareConfig[],
  ) {
    return initMiddlewares(server, middlewareConfigs);
  }
}

/**
 * Main ConnectRPC class to manage registration of controllers and middlewares
 */
export const ConnectRPC = new ConnectRPCClass();
