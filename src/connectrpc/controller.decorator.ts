import { GenService, GenServiceMethods } from '@bufbuild/protobuf/codegenv2';

import { CONTROLLER_METADATA_KEY } from './constants';
import { ControllersStore } from './metadata';
import { Injectable } from '@nestjs/common';

export type ServiceType<T extends GenServiceMethods> = GenService<T>;

export type ControllerOptions<T extends GenServiceMethods> = {
  service: ServiceType<T>;
};

/**
 * Automatically discover method mappings by matching service methods to controller methods
 */
function discoverMethodMappings(
  target: Function,
  service: GenService<any>,
): Record<string, string> {
  const methodMappings: Record<string, string> = {};
  const prototype = target.prototype;

  // service.methods is an array of method descriptors
  const serviceMethods = Array.isArray(service.methods) ? service.methods : [];

  // Get all controller methods
  const controllerMethods = Object.getOwnPropertyNames(prototype).filter(
    (name) => name !== 'constructor' && typeof prototype[name] === 'function',
  );

  // Check each service method
  for (const methodDesc of serviceMethods) {
    const serviceMethodName = methodDesc.name; // e.g., "Say" - this is what connectrpc module uses as key
    const localName = methodDesc.localName; // e.g., "say" (camelCase version)

    // Try to find a matching controller method
    // First try exact match with localName (camelCase), then try case-insensitive
    let controllerMethodName = controllerMethods.find(
      (name) => name === localName,
    );

    if (!controllerMethodName) {
      controllerMethodName = controllerMethods.find(
        (name) => name.toLowerCase() === serviceMethodName.toLowerCase(),
      );
    }

    if (controllerMethodName) {
      // Map using the service method name (e.g., "Say") because that's what the module looks for
      methodMappings[serviceMethodName] = controllerMethodName;
    }
  }

  return methodMappings;
}

export function Controller<T extends GenServiceMethods>(
  options: ControllerOptions<T>,
) {
  return function <TClass extends new (...args: any[]) => any>(target: TClass) {
    const service = options.service;

    // Automatically discover method mappings
    const methodMappings = discoverMethodMappings(target, service);

    Reflect.defineMetadata(
      CONTROLLER_METADATA_KEY,
      { service, methodMappings },
      target,
    );

    // Log what we found
    console.log(
      `Registering controller ${target.name} for service ${service.typeName}`,
    );
    for (const [serviceName, controllerMethodName] of Object.entries(
      methodMappings,
    )) {
      console.log(`  ${serviceName} -> ${controllerMethodName}`);
    }

    ControllersStore.push({
      target,
      service,
      methodMappings,
    });

    // Make the class injectable so it can be used in NestJS DI system
    Injectable()(target);

    return target;
  };
}
