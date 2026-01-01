import { bootstrap } from 'src/bootstrap';

async function setupServerAndClient() {
  await bootstrap();

  import('../client/say.js');
}

setupServerAndClient();
