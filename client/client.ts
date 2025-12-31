import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-node';
import { ElizaService } from 'gen/connectrpc/eliza/v1/eliza_pb';

const transport = createConnectTransport({
  baseUrl: 'http://localhost:3000',
  httpVersion: '1.1',
});

export const client = createClient(ElizaService, transport);
