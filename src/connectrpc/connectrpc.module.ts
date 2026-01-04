import { ConnectRouter } from '@connectrpc/connect';
import { fastifyConnectPlugin } from '@connectrpc/connect-fastify';
import { DynamicModule, Inject, Logger, Module } from '@nestjs/common';
import { HttpAdapterHost, ModuleRef } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ControllersStore } from './metadata';
import { convertMiddlewareToHook } from './helpers';
import type { ModuleOptions } from './interfaces';

const CONNECTRPC_MODULE_OPTIONS = Symbol('CONNECTRPC_MODULE_OPTIONS');

@Module({})
export class ConnectrpcModule {
  static readonly logger = new Logger(ConnectrpcModule.name, {
    timestamp: true,
  });
  private readonly logger = ConnectrpcModule.logger;

  /**
   * Configure the ConnectRPC module with options
   */
  static forRoot(options: ModuleOptions = {}): DynamicModule {
    return {
      module: ConnectrpcModule,
      global: true,
      providers: [
        {
          provide: CONNECTRPC_MODULE_OPTIONS,
          useValue: options,
        },
        // Register middleware classes as providers so they can be injected
        ...(options.middlewares?.map((config) => config.use) || []),
      ],
      exports: [CONNECTRPC_MODULE_OPTIONS],
    };
  }

  // For injections
  constructor(
    @Inject(HttpAdapterHost)
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(ModuleRef)
    private readonly moduleRef: ModuleRef,
    @Inject(CONNECTRPC_MODULE_OPTIONS)
    private readonly options: ModuleOptions,
  ) {}

  private getServer() {
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
    return server;
  }

  /** This must be called after app is initialized and before server starts listening */
  async registerPlugin() {
    const server = this.getServer();

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
        const { name } = methodDesc;
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

    await server.register(fastifyConnectPlugin, {
      // For now we enable only Connect protocol by default and disable others.
      // grpc: this.options.grpc ?? false,
      // grpcWeb: this.options.grpcWeb ?? false,
      // connect: this.options.connect ?? true,
      grpc: false,
      grpcWeb: false,
      connect: true,
      acceptCompression: this.options.acceptCompression ?? [],
      routes: routes,
    });

    this.logger.log('Ready');
  }

  private async registerMiddlewares() {
    const server = this.getServer();

    // Apply configured middleware to ConnectRPC routes
    const middlewareConfigs = this.options.middlewares || [];
    this.logger.log(
      `Found ${middlewareConfigs.length} middleware configurations to apply`,
    );

    for (const config of middlewareConfigs) {
      // Convert method names to set with PascalCase
      const methods = new Set(
        (config.methods || []).map((m) => m[0].toUpperCase() + m.slice(1)),
      );

      const middlewareInstance = this.moduleRef.get(config.use, {
        strict: false,
      });

      if (middlewareInstance && typeof middlewareInstance.use === 'function') {
        const hook = convertMiddlewareToHook(middlewareInstance);

        // Create a filtered hook that checks service and method
        const filteredHook = async (request: any, reply: any) => {
          const url = request.url as string;

          // Parse the URL to get service and method
          // Format: /package.ServiceName/MethodName
          const match = url.match(/^\/([^/]+)\/([^/]+)$/);

          if (!match) {
            // Not a ConnectRPC route, skip
            return;
          }

          const [, serviceName, methodName] = match;

          // Check if middleware should apply to this service
          if (config.on && config.on.typeName !== serviceName) {
            return;
          }

          // Check if middleware should apply to this method
          if (methods.size && !methods.has(methodName)) {
            return;
          }

          // Apply the middleware
          await hook(request, reply);
        };

        server.addHook('onRequest', filteredHook);

        const serviceInfo = config.on
          ? ` to service ${config.on.typeName}`
          : ' to all services';
        const methodInfo = config.methods
          ? ` methods [${config.methods.join(', ')}]`
          : ' all methods';
        this.logger.log(
          `Applied middleware: ${config.use.name}${serviceInfo}${methodInfo}`,
        );
      }
    }
  }

  async onModuleInit() {
    await this.registerMiddlewares();
  }

  // For cleanup
  async onModuleDestroy() {}
}
