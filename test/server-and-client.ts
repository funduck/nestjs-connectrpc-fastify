import { bootstrap } from 'src/bootstrap';
import { create } from '@bufbuild/protobuf';
import {
  ElizaService,
  SayRequestSchema,
} from '../gen/connectrpc/eliza/v1/eliza_pb';
import { createConnectTransport } from '@connectrpc/connect-node';
import { createClient } from '@connectrpc/connect';

const transport = createConnectTransport({
  baseUrl: 'http://localhost:3000',
  httpVersion: '1.1',
});

export const client = createClient(ElizaService, transport);

const mockAuthorizationToken = 'Bearer mock-token-123';

async function testUnary() {
  console.log('\n=== Testing Unary RPC: Say ===');
  const sentence = 'Hello ConnectRPC!';
  console.log(`Request: "${sentence}"`);

  try {
    const response = await client.say(
      { sentence },
      {
        headers: {
          Authorization: mockAuthorizationToken,
          'x-request-id': 'unary-test-001',
        },
      },
    );
    console.log(`Response: "${response.sentence}"`);
    console.log('✅ Unary RPC test passed\n');
    return true;
  } catch (error) {
    console.error('❌ Error calling Say:', error);
    return false;
  }
}

async function testClientStreaming() {
  console.log('=== Testing Client Streaming RPC: SayMany ===');
  const sentences = ['First message', 'Second message', 'Third message'];
  console.log('Sending multiple requests:', sentences);

  try {
    // Create an async generator to send multiple requests
    async function* generateRequests() {
      for (const sentence of sentences) {
        console.log(`  Sending: "${sentence}"`);
        yield create(SayRequestSchema, { sentence });
      }
    }

    const response = await client.sayMany(generateRequests(), {
      headers: {
        Authorization: mockAuthorizationToken,
        'x-request-id': 'client-streaming-test-001',
      },
    });
    console.log(`Received ${response.responses.length} responses:`);
    response.responses.forEach((resp, idx) => {
      console.log(`  [${idx + 1}] ${resp.sentence}`);
    });
    console.log('✅ Client Streaming RPC test passed\n');
    return true;
  } catch (error) {
    console.error('❌ Error calling SayMany:', error);
    return false;
  }
}

async function testServerStreaming() {
  console.log('=== Testing Server Streaming RPC: ListenMany ===');
  const sentence = 'Hello Streaming World';
  console.log(`Request: "${sentence}"`);
  console.log('Receiving streamed responses:');

  try {
    let count = 0;
    for await (const response of client.listenMany(
      { sentence },
      {
        headers: {
          Authorization: mockAuthorizationToken,
          'x-request-id': 'server-streaming-test-001',
        },
      },
    )) {
      count++;
      console.log(`  [${count}] ${response.sentence}`);
    }
    console.log(
      `✅ Server Streaming RPC test passed (received ${count} responses)\n`,
    );
    return true;
  } catch (error) {
    console.error('❌ Error calling ListenMany:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting ConnectRPC Tests\n');

  // Bootstrap the server
  await bootstrap();

  // Give the server a moment to start
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Run all tests
  const results = [
    await testUnary(),
    await testClientStreaming(),
    await testServerStreaming(),
  ];

  // Check results
  const allPassed = results.every((result) => result === true);

  if (allPassed) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

runAllTests();
