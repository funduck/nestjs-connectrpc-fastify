import { client } from './client';

async function testSay() {
  const sentence = 'Hello ConnectRPC!';
  console.log(`Testing say("${sentence}")`);

  client
    .say({
      sentence,
    })
    .then((response) => {
      console.log('Response from Say:', response);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error calling Say:', error);
      process.exit(1);
    });
}

testSay();
