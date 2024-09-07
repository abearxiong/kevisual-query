import { adapter } from './adapter.ts';

type Fn = (opts: {
  url?: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  [key: string]: any;
  timeout?: number;
}) => Promise<Record<string, any>>;

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
export class Query {
  adapter: typeof adapter;
  url: string;
  beforeRequest?: Fn;
  headers?: Record<string, string>;
  timeout?: number;
  constructor(opts: QueryOpts) {
    this.adapter = opts.adapter || adapter;
    this.url = opts.url || '/api/router';
    this.headers = opts.headers || {
      'Content-Type': 'application/json',
    };
    this.timeout = opts.timeout || 60000; // 默认超时时间为 60s
  }
  async get<T>(params: Record<string, any> & Data & T, options?: DataOpts) {
    return this.post(params, options);
  }
  async post<T>(body: Record<string, any> & Data & T, options?: DataOpts) {
    const url = options?.url || this.url;
    const headers = { ...this.headers, ...options?.headers };
    const adapter = options?.adapter || this.adapter;
    const beforeRequest = options?.beforeRequest || this.beforeRequest;
    const timeout = options?.timeout || this.timeout;
    const req = {
      url: url,
      headers: headers,
      body,
      timeout,
    };
    if (beforeRequest) {
      await beforeRequest(req);
    }
    return adapter(req);
  }
  before(fn: Fn) {
    this.beforeRequest = fn;
  }
}

export { adapter };
