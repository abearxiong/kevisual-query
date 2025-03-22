// @ts-ignore
import { QueryClient } from '@kevisual/query';

const query = new QueryClient({ url: '/api/router', io: true });

query.qws.listenConnect(() => {
  console.log('Connected');
  // query.qws.send({
  //   type: 'subscribe',
  // });
  // query.qws.connect().then((res) => {
  //   console.log('Connected', res);
  //   query.qws.send({
  //     type: 'subscribe',
  //   });
  // });
});

query.qws.connect().then((res) => {
  console.log('Connected', res);
  query.qws.send({
    type: 'subscribe',
  });
  query.qws.ws.addEventListener('message', (event) => {
    console.log('get', event.data);
  });
});
