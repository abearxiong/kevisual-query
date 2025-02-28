import { adapter } from './adapter.ts';
type Fn = (opts: {
  url?: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  [key: string]: any;
  timeout?: number;
}) => Promise<Record<string, any>>;

export type QueryOpts = {
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
    this.timeout = opts?.timeout || 60000 * 3; // 默认超时时间为 60s * 3
  }
  async get<T = any, S = any>(params: Record<string, any> & Data & U & T, options?: DataOpts): Promise<Result<V & S>> {
    return this.post(params, options);
  }
  async post<T = any, S = any>(body: Record<string, any> & Data & T, options?: DataOpts): Promise<Result<S>> {
    const url = options?.url || this.url;
    const headers = { ...this.headers, ...options?.headers };
    const adapter = options?.adapter || this.adapter;
    const beforeRequest = options?.beforeRequest || this.beforeRequest;
    const afterResponse = options?.afterResponse || this.afterResponse;
    const timeout = options?.timeout || this.timeout;
    const req = {
      url: url,
      headers: headers,
      body,
      timeout,
    };
    try {
      if (beforeRequest) {
        await beforeRequest(req);
      }
    } catch (e) {
      console.error(e);
      return {
        code: 500,
        success: false,
        message: 'api request beforeFn error',
      };
    }
    return adapter(req).then(async (res) => {
      try {
        res.success = res.code === 200;
        if (afterResponse) {
          return await afterResponse(res);
        }
        return res;
      } catch (e) {
        console.error(e);
        return {
          code: 500,
          success: false,
          message: 'api request afterFn error',
        };
      }
    });
  }
  before(fn: Fn) {
    this.beforeRequest = fn;
  }
  after(fn: (result: Result) => Promise<any>) {
    this.afterResponse = fn;
  }
}

export { adapter };
