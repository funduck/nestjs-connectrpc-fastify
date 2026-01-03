import { ConnectRouter } from '@connectrpc/connect';
import { fastifyConnectPlugin } from '@connectrpc/connect-fastify';
import { Inject, Logger, Module } from '@nestjs/common';
import { HttpAdapterHost, ModuleRef } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ControllersStore } from './metadata';

@Module({})
export class ConnectrpcModule {
  static readonly logger = new Logger(ConnectrpcModule.name, {
    timestamp: true,
  });
  private readonly logger = ConnectrpcModule.logger;

  // For injections
  constructor(
    @Inject(HttpAdapterHost)
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(ModuleRef)
    private readonly moduleRef: ModuleRef,
  ) {}

  // For binding router to server
  async registerPlugin() {
    const httpAdapter = this.httpAdapterHost.httpAdapter;

    if (!httpAdapter) {
      throw new Error('HTTP Adapter not found');
    }

    // For now, only Fastify is supported
    if (!(httpAdapter instanceof FastifyAdapter)) {
      throw new Error('Only FastifyAdapter is supported');
    }
    const fastifyAdapter = httpAdapter as FastifyAdapter;

    const server = fastifyAdapter.getInstance();

    // Create implementations from controller instances
    const implementations = new Map<Function, any>();

    for (const controllerMeta of ControllersStore) {
      const { target, methodMappings, service } = controllerMeta;

      // Get the actual controller instance from NestJS DI container
      const controllerInstance = this.moduleRef.get(target as any, {
        strict: false,
      });

      // Create the implementation object
      const implementation: any = {};

      // Bind each method from the service
      for (const methodDesc of service.methods) {
        const { methodKind, name } = methodDesc;
        const methodName = name[0].toLowerCase() + name.slice(1);

        // Check if there's a mapped controller method
        const controllerMethodName = methodMappings[name];

        if (controllerMethodName) {
          const controllerMethod = controllerInstance[controllerMethodName];

          if (controllerMethod) {
            // Bind the method with proper 'this' context
            implementation[methodName] =
              controllerMethod.bind(controllerInstance);
            this.logger.log(
              `Binding ${target.name}.${controllerMethodName} to ${service.typeName}.${name}`,
            );
          } else {
            this.logger.warn(
              `Method ${controllerMethodName} not found in ${target.name}`,
            );
          }
        } else {
          // No mapped method - create default error implementation
          switch (methodKind) {
            case 'unary':
              implementation[methodName] = async (req: any, context: any) => {
                throw new Error(
                  `Method ${name} not implemented in controller ${target.name}`,
                );
              };
              break;
            case 'client_streaming':
              implementation[methodName] = async (req: any, context: any) => {
                throw new Error(
                  `Method ${name} not implemented in controller ${target.name}`,
                );
              };
              break;
            case 'server_streaming':
              implementation[methodName] = async function* (
                req: any,
                context: any,
              ) {
                throw new Error(
                  `Method ${name} not implemented in controller ${target.name}`,
                );
              };
              break;
            case 'bidi_streaming':
              throw new Error(
                `Bidirectional streaming not supported as it requires HTTP/2`,
              );
          }
        }
      }

      implementations.set(target, implementation);
    }

    const routes = (router: ConnectRouter) => {
      for (const { service, target } of ControllersStore) {
        const implementation = implementations.get(target);
        router.service(service, implementation);
        this.logger.log(`Registered {/${service.typeName}} route`);
      }
    };

    if (routes.length === 0) {
      this.logger.warn('No controllers found to register');
      return;
    }

    // Remove the default JSON parser to avoid conflict with Connect-RPC
    // Connect-RPC will add its own no-op parsers for the content types it needs
    // if (server.hasContentTypeParser('application/json')) {
    //   server.removeContentTypeParser('application/json');
    // }

    await server.register(fastifyConnectPlugin, {
      grpc: false, // disable grpc
      grpcWeb: false, // disable grpc-web
      connect: true, // we only use connect
      // interceptors: [createValidateInterceptor()], // skip validation for performance
      acceptCompression: [], // skip compression for performance
      routes: routes,
    });

    // if (!server.hasContentTypeParser('application/json')) {
    //   throw new Error(
    //     `Something went wrong, ConnectRPC was supposed to register a JSON parser`,
    //   );
    // }

    this.logger.log('Ready');
  }

  // For cleanup
  async onModuleDestroy() {}
}
