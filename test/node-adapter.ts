import { nodeAdapter } from "../src/node-adapter";

// tsx test/node-adapter.ts
const main = async () => {
  const res = await nodeAdapter({
    url: 'http://127.0.0.1/api/router',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      path: 'demo',
      key: '1',
    },
  });
  console.log(res);
};
main();
