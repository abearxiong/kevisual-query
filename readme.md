# query

对应的 fetch 内容的一部分功能的封装。

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