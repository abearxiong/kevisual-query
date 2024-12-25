import { App } from '@kevisual/router';

const app = new App({
  io: true,
});

app
  .route({
    path: 'test',
    key: 'test',
  })
  .define(async (ctx) => {
    ctx.body = 'test';
  })
  .addTo(app);

app.listen(4000, () => {
  console.log('Server is running at http://localhost:4000');
});

app.io.addListener('subscribe', async ({ data, end, ws }) => {
  console.log('A user connected', data);
  ws.send('Hello World');
});
