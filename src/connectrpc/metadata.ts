import { GenService } from '@bufbuild/protobuf/codegenv2';
import { NestMiddleware, Type } from '@nestjs/common';

export const ControllersStore: Array<{
  target: Function;
  service: GenService<any>;
  methodMappings: Record<string, string>; // Maps service method name to controller method name
}> = [];

/**
 * Store for middleware classes and their instances
 */
class MiddlewareStoreClass {
  private middlewares = new Map<Type<NestMiddleware>, NestMiddleware>();

  /**
   * Register a middleware instance from its constructor
   */
  registerInstance(
    self: NestMiddleware,
    {
      allowMultipleInstances = false,
    }: {
      allowMultipleInstances?: boolean;
    } = {},
  ) {
    const middlewareClass = self.constructor as Type<NestMiddleware>;
    if (!allowMultipleInstances && this.middlewares.has(middlewareClass)) {
      throw new Error(
        `Middleware ${middlewareClass.name} is already registered! This may happen if you export middleware as provider and also register it in some Nest module.`,
      );
    }
    this.middlewares.set(middlewareClass, self);
  }

  /**
   * Get a middleware instance by its class
   */
  getInstance(middlewareClass: Type<NestMiddleware>): NestMiddleware | null {
    return this.middlewares.get(middlewareClass) || null;
  }
}

export const MiddlewareStore = new MiddlewareStoreClass();
