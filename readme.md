# query

对 fetch 功能的的一部分功能的封装。主要处理header的token的提交和response中的处理json。

主要目的：请求路径默认`/api/router`，使用`post`,`post`的数据分流使用`path`和`key`.

适配后端的项目 [@kevisual/router](https://git.xiongxiao.me/kevisual/router)

## query

```ts
const query = new Query();
const res = await query.post({
  path: 'demo',
  key: '1',
});
```

### 参数

```ts
type QueryOpts = {
  url?: string;
  adapter?: typeof adapter;
  headers?: Record<string, string>;
  timeout?: number;
};
type Data = {
  path?: string;
  key?: string;
  [key: string]: any;
};
// 额外功能
type DataOpts = Partial<QueryOpts> & {
  beforeRequest?: Fn;
};
```

## 适配的@kevisual/router的代码

```ts
import { App } from '@kevisual/router';
const app = new App();

app
  .route({
    path: 'demo',
    key: '1',
  })
  .define(async (ctx) => {
    ctx.body = 234;
  })
  .addTo(app);
```
