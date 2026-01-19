import {
  DynamicModule,
  Inject,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { ConnectRPCModuleOptions } from './interfaces';
import { ConnectRPC } from 'src/connectrpc-fastify/connectrpc';

const CONNECTRPC_MODULE_OPTIONS = Symbol('CONNECTRPC_MODULE_OPTIONS');

/**
 * NestJS module for ConnectRPC integration
 *
 * Call registerPlugin() after app initialization and before server starts listening
 *
 * ## Middlewares
 * To register middlewares, use ConnectRPC.registerMiddleware() in the middleware constructors
 * and provide the middlewares in the ConnectRPCModule options.
 *
 * Example:
 * ```typescript
 * @Injectable()
 * export class MyMiddleware implements NestMiddleware {
 *   constructor() {
 *     ConnectRPC.registerMiddleware(this);
 *   }
 *
 *   use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
 *     // Middleware logic
 *     next();
 *   }
 * }
 * ```
 *
 * Then provide the middleware in the module:
 * ```typescript
 * @Module({
 *   imports: [
 *     ConnectRPCModule.forRoot({
 *       middlewares: [
 *         middleware(MyMiddleware),
 *         middleware(AnotherMiddleware),
 *       ],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * ## Guards
 * Guards are automatically initialized and executed after all middlewares.
 * To register guards, use ConnectRPC.registerGuard() in the guard constructor.
 *
 * Example:
 * ```typescript
 * @Injectable()
 * export class AuthGuard implements CanActivate {
 *   constructor() {
 *     ConnectRPC.registerGuard(this);
 *   }
 *
 *   canActivate(context: ExecutionContext): boolean | Promise<boolean> {
 *     const request = context.switchToHttp().getRequest();
 *     const handler = context.getHandler();
 *     const controller = context.getClass();
 *
 *     // Your guard logic here
 *     return true;
 *   }
 * }
 * ```
 *
 * Guards have access to:
 * - `context.getClass()` - The controller class
 * - `context.getHandler()` - The controller method
 * - `context.switchToHttp().getRequest()` - The Fastify request object
 * - `context.switchToHttp().getResponse()` - The Fastify response object
 *
 * You can use decorators with Reflect metadata to skip guards on specific methods:
 * ```typescript
 * @SkipAuthGuard()
 * async say(request: SayRequest): Promise<SayResponse> {
 *   // This method will skip the AuthGuard
 * }
 * ```
 *
 * Guards are applied globally to all routes. If a guard returns false or throws an error,
 * the request will be rejected with a 403 Forbidden response.
 */
@Module({})
export class ConnectRPCModule implements OnModuleInit {
  static readonly logger = new Logger(ConnectRPCModule.name, {
    timestamp: true,
  });
  private readonly logger = ConnectRPCModule.logger;

  /**
   * Configure the ConnectRPC module with options
   */
  static forRoot(options: ConnectRPCModuleOptions = {}): DynamicModule {
    if (options.logger) ConnectRPC.setLogger(options.logger);
    return {
      module: ConnectRPCModule,
      global: true,
      providers: [
        {
          provide: CONNECTRPC_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [CONNECTRPC_MODULE_OPTIONS],
    };
  }

  // For injections
  constructor(
    @Inject(HttpAdapterHost)
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(CONNECTRPC_MODULE_OPTIONS)
    private readonly options: ConnectRPCModuleOptions,
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

  private registerPluginCalled = false;

  /** This must be called after app is initialized and before server starts listening */
  async registerPlugin() {
    if (this.registerPluginCalled) {
      this.logger.warn('registerPlugin() has already been called');
      return;
    }
    this.registerPluginCalled = true;

    const server = this.getServer();
    if (!server) {
      throw new Error('Fastify server instance not found');
    }

    await ConnectRPC.registerFastifyPlugin(server);
  }

  /** This is called by NestJS after the module has been initialized */
  async onModuleInit() {
    if (!this.registerPluginCalled) {
      throw new Error(
        'ConnectRPCModule.onModuleInit: registerPlugin() has not been called. Please call registerPlugin() after app initialization and before server starts listening.',
      );
    }

    const server = this.getServer();

    // Initialize middlewares first
    await ConnectRPC.initMiddlewares(server, this.options.middlewares || []);

    // Initialize guards after middlewares
    await ConnectRPC.initGuards(server);
  }
}
