import { GenService } from '@bufbuild/protobuf/codegenv2';

export const ControllersStore: Array<{
  target: Function;
  service: GenService<any>;
  methodMappings: Record<string, string>; // Maps service method name to controller method name
}> = [];
