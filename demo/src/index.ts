// console.log('Hello World');
import { adapter, Query } from '@abearxiong/query';

window.onload = async () => {
  // const res = await adapter({
  //   url: '/api/router',
  //   body: {
  //     path: 'demo',
  //     key: '1',
  //   },
  // });
  // console.log(res);
  const query = new Query({ url: '/api/router' });
  // const res = await query.post(
  //   {
  //     path: 'demo',
  //     key: '1',
  //   },
  // );
  const res = await query.post(
    {
      path: 'demo',
      key: '3',
    },
    {
      timeout: 5000,
    },
  );
  console.log(res);
};
