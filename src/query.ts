import { adapter } from './adapter.ts';
/**
 * 请求前处理函数
 * @param opts 请求配置
 * @returns 请求配置
 */
export type Fn = (opts: {
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
export type Data = {
  path?: string;
  key?: string;
  payload?: Record<string, any>;
  [key: string]: any;
};
export type Result<S = any> = {
  code: number;
  data?: S;
  message?: string;
  success: boolean;
  /**
   * 是否不返回 message
   */
  noMsg?: boolean;
  /**
   * 显示错误, 当 handle的信息被处理的时候，如果不是success，同时自己设置了noMsg，那么就不显示错误信息了，因为被处理。
   *
   * 日常: fetch().then(res=>if(res.sucess){message.error('error')})的时候，比如401被处理过了，就不再提示401错误了。
   *
   */
  showError: (fn?: () => void) => void;
};
// 额外功能
export type DataOpts = Partial<QueryOpts> & {
  beforeRequest?: Fn;
  afterResponse?: <S, U = S>(result: Result<S>, ctx?: { req?: any; res?: any; fetch?: any }) => Promise<U>;
};
/**
 * 设置基础响应, 设置 success 和 showError,
 * success 是 code 是否等于 200
 * showError 是 如果 success 为 false 且 noMsg 为 false, 则调用 showError
 * @param res 响应
 */
export const setBaseResponse = (res: Result) => {
  res.success = res.code === 200;
  /**
   * 显示错误
   * @param fn 错误处理函数
   */
  res.showError = (fn?: () => void) => {
    if (!res.success && !res.noMsg) {
      fn?.();
    }
  };
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
export class Query {
  adapter: typeof adapter;
  url: string;
  beforeRequest?: Fn;
  afterResponse?: DataOpts['afterResponse'];
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
  /**
   * 发送 get 请求，转到 post 请求
   *  T是请求类型自定义
   *  S是返回类型自定义
   * @param params 请求参数
   * @param options 请求配置
   * @returns 请求结果
   */
  async get<R = any, P = any>(params: Data & P, options?: DataOpts): Promise<Result<R>> {
    return this.post(params, options);
  }
  /**
   * 发送 post 请求
   *  T是请求类型自定义
   *  S是返回类型自定义
   * @param body 请求体
   * @param options 请求配置
   * @returns 请求结果
   */
  async post<R = any, P = any>(body: Data & P, options?: DataOpts): Promise<Result<R>> {
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
      console.error('request beforeFn error', e, req);
      return {
        code: 500,
        success: false,
        message: 'api request beforeFn error',
        showError: () => {},
      };
    }
    return adapter(req).then(async (res) => {
      try {
        setBaseResponse(res);
        if (afterResponse) {
          return await afterResponse(res, {
            req,
            res,
            fetch: adapter,
          });
        }

        return res;
      } catch (e) {
        console.error('request error', e, req);
        return {
          code: 500,
          success: false,
          message: 'api request afterFn error',
          showError: () => {},
        };
      }
    });
  }
  /**
   * 请求前处理，设置请求前处理函数
   * @param fn 处理函数
   */
  before(fn: Fn) {
    this.beforeRequest = fn;
  }
  /**
   * 请求后处理，设置请求后处理函数
   * @param fn 处理函数
   */
  after(fn: (result: Result, req?: any) => Promise<any>) {
    this.afterResponse = fn;
  }
}

export { adapter };
