import { client } from './client';

async function testHello() {
  console.log('Testing Hello...');

  client
    .say({
      sentence: 'Hello ConnectRPC!',
    })
    .then((response) => {
      console.log('Response from Say:', response);
    });
}

testHello();
