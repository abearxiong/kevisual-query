import { QueryWs } from '../src/ws';

const queryWs = new QueryWs({ url: '/api/ws' });

queryWs.listenConnect(() => {
  console.log('Connected');
});

queryWs.store.getState().setConnected(true);
queryWs.store.getState().setConnected(false);
setTimeout(() => {
  queryWs.store.getState().setConnected(true);
}, 1000);
