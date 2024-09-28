import { adapter } from './adapter.ts';
import { QueryWs } from './ws.ts';
export { QueryOpts };
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
  payload?: Record<string, any>;
  [key: string]: any;
};
type Result<S = any> = {
  code: number;
  data?: S;
  message?: string;
  success: boolean;
};
// 额外功能
type DataOpts = Partial<QueryOpts> & {
  beforeRequest?: Fn;
  afterResponse?: (result: Result) => Promise<any>;
};
/**
 * const query = new Query();
 * const res = await query.post({
 *   path: 'demo',
 *   key: '1',
 *  });
 *
 * U是参数 V是返回值
 */
export class Query<U = any, V = any> {
  adapter: typeof adapter;
  url: string;
  beforeRequest?: Fn;
  afterResponse?: (result: Result) => Promise<any>;
  headers?: Record<string, string>;
  timeout?: number;
  constructor(opts?: QueryOpts) {
    this.adapter = opts?.adapter || adapter;
    this.url = opts?.url || '/api/router';
    this.headers = opts?.headers || {
      'Content-Type': 'application/json',
    };
    this.timeout = opts?.timeout || 60000; // 默认超时时间为 60s
  }
  async get<T = any, S = any>(params: Record<string, any> & Data & U & T, options?: DataOpts): Promise<Result<V & S>> {
    return this.post(params, options);
  }
  async post<T = any, S = any>(body: Record<string, any> & Data & T, options?: DataOpts): Promise<Result<S>> {
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
    return adapter(req).then(async (res) => {
      res.success = res.code === 200;
      if (options?.afterResponse) {
        return await options.afterResponse(res);
      }
      return res;
    });
  }
  before(fn: Fn) {
    this.beforeRequest = fn;
  }
  after(fn: (result: Result) => Promise<any>) {
    this.afterResponse = fn;
  }
}
/**
 * 前端调用后端QueryRouter
 */
export class QueryClient<U = any, V = any> extends Query<U, V> {
  tokenName: string;
  storage: Storage;
  token: string;
  qws: QueryWs;
  constructor(opts?: QueryOpts & { tokenName?: string; storage?: Storage }) {
    super(opts);
    this.tokenName = opts?.tokenName || 'token';
    this.storage = opts?.storage || localStorage;
    this.beforeRequest = async (opts) => {
      const token = this.token || this.getToken();
      if (token) {
        opts.headers = {
          ...opts.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return opts;
    };
    this.qws = new QueryWs({ url: opts?.url });
  }
  getToken() {
    return this.storage.getItem(this.tokenName);
  }
  saveToken(token: string) {
    this.storage.setItem(this.tokenName, token);
  }
  removeToken() {
    this.storage.removeItem(this.tokenName);
  }
}

export { adapter };
