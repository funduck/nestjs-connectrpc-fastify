import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Helper to convert NestJS middleware to Fastify hook
 */
export function convertMiddlewareToHook(
  middlewareInstance: any,
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // NestJS middleware expects raw req/res
        middlewareInstance.use(request.raw, reply.raw, (err?: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };
}
