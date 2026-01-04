import { GenService } from '@bufbuild/protobuf/codegenv2';
import { NestMiddleware, Type } from '@nestjs/common';

class ControllersStoreClass {
  private controllers = new Map<
    Type<any>,
    {
      instance: any;
      service: GenService<any>;
    }
  >();

  values() {
    return Array.from(this.controllers.entries()).map(([target, data]) => ({
      target,
      ...data,
    }));
  }

  registerInstance(
    self: Function,
    service: GenService<any>,
    {
      allowMultipleInstances = false,
    }: {
      allowMultipleInstances?: boolean;
    } = {},
  ) {
    const controllerClass = self.constructor as Type<any>;
    if (!allowMultipleInstances && this.controllers.has(controllerClass)) {
      throw new Error(
        `Controller ${controllerClass.name} is already registered! This may happen if you export controller as provider and also register it in some Nest module.`,
      );
    }
    this.controllers.set(controllerClass, {
      instance: self,
      service,
    });
  }
}

export const ControllersStore = new ControllersStoreClass();

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
