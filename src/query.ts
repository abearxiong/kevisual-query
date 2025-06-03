import { adapter, isTextForContentType, Method } from './adapter.ts';
import type { QueryWs } from './ws.ts';
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
}) => Promise<Record<string, any> | false>;

export type QueryOpts = {
  url?: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  timeout?: number;
  method?: Method;
  isBlob?: boolean; // 是否返回 Blob 对象

  adapter?: typeof adapter;
  [key: string]: any;
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
  afterResponse?: <S = any>(result: Result<S>, ctx?: { req?: any; res?: any; fetch?: any }) => Promise<Result<S>>;
};
/**
 * 设置基础响应, 设置 success 和 showError,
 * success 是 code 是否等于 200
 * showError 是 如果 success 为 false 且 noMsg 为 false, 则调用 showError
 * @param res 响应
 */
export const setBaseResponse = (res: Partial<Result>) => {
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
  return res as Result;
};
export const wrapperError = ({ code, message }: { code?: number; message?: string }) => {
  const result = {
    code: code || 500,
    success: false,
    message: message || 'api request error',
    showError: (fn?: () => void) => {
      //
    },
    noMsg: true,
  };
  return result;
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
  beforeRequest?: DataOpts['beforeRequest'];
  afterResponse?: DataOpts['afterResponse'];
  headers?: Record<string, string>;
  timeout?: number;
  /**
   * 需要突然停止请求，比如401的时候
   */
  stop?: boolean;
  // 默认不使用ws
  qws: QueryWs;

  constructor(opts?: QueryOpts) {
    this.adapter = opts?.adapter || adapter;
    this.url = opts?.url || '/api/router';
    this.headers = opts?.headers || {
      'Content-Type': 'application/json',
    };
    this.timeout = opts?.timeout || 60000 * 3; // 默认超时时间为 60s * 3
  }
  setQueryWs(qws: QueryWs) {
    this.qws = qws;
  }
  /**
   * 突然停止请求
   */
  setStop(stop: boolean) {
    this.stop = stop;
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
    const { headers, adapter, beforeRequest, afterResponse, timeout, ...rest } = options || {};
    const _headers = { ...this.headers, ...headers };
    const _adapter = adapter || this.adapter;
    const _beforeRequest = beforeRequest || this.beforeRequest;
    const _afterResponse = afterResponse || this.afterResponse;
    const _timeout = timeout || this.timeout;
    const req = {
      url: url,
      headers: _headers,
      body,
      timeout: _timeout,
      ...rest,
    };
    try {
      if (_beforeRequest) {
        const res = await _beforeRequest(req);
        if (res === false) {
          return wrapperError({
            code: 500,
            message: 'request is cancel',
            // @ts-ignore
            req: req,
          });
        }
      }
    } catch (e) {
      console.error('request beforeFn error', e, req);
      return wrapperError({
        code: 500,
        message: 'api request beforeFn error',
        // @ts-ignore
        req: req,
      });
    }
    if (this.stop) {
      const that = this;
      await new Promise((resolve) => {
        let timer = 0;
        const detect = setInterval(() => {
          if (!that.stop) {
            clearInterval(detect);
            resolve(true);
          }
          timer++;
          if (timer > 30) {
            console.error('request stop: timeout', req.url, timer);
          }
        }, 1000);
      });
    }
    return _adapter(req).then(async (res) => {
      try {
        setBaseResponse(res);
        if (_afterResponse) {
          return await _afterResponse(res, {
            req,
            res,
            fetch: adapter,
          });
        }

        return res;
      } catch (e) {
        console.error('request afterFn error', e, req);
        return wrapperError({
          code: 500,
          message: 'api request afterFn error',
          // @ts-ignore
          req: req,
        });
      }
    });
  }
  /**
   * 请求前处理，设置请求前处理函数
   * @param fn 处理函数
   */
  before(fn: DataOpts['beforeRequest']) {
    this.beforeRequest = fn;
  }
  /**
   * 请求后处理，设置请求后处理函数
   * @param fn 处理函数
   */
  after(fn: DataOpts['afterResponse']) {
    this.afterResponse = fn;
  }
  async fetchText(urlOrOptions?: string | QueryOpts, options?: QueryOpts): Promise<Result<any>> {
    let _options = { ...options };
    if (typeof urlOrOptions === 'string' && !_options.url) {
      _options.url = urlOrOptions;
    }
    if (typeof urlOrOptions === 'object') {
      _options = { ...urlOrOptions, ..._options };
    }
    const res = await adapter({
      method: 'GET',
      ..._options,
      headers: {
        ...this.headers,
        ...(_options?.headers || {}),
      },
    });
    return setBaseResponse(res);
  }
}

export { adapter };

export class BaseQuery<T extends Query = Query, R extends { queryChain?: any; query?: any } = { queryChain: any; query?: T }> {
  query: T;
  queryDefine: R;
  constructor(opts?: { query?: T; queryDefine?: R; clientQuery?: T }) {
    if (opts?.clientQuery) {
      this.query = opts.clientQuery;
    } else {
      this.query = opts?.query;
    }
    if (opts.queryDefine) {
      this.queryDefine = opts.queryDefine;
      this.queryDefine.query = this.query;
    }
  }
  get chain(): R['queryChain'] {
    return this.queryDefine.queryChain;
  }
  post<R = any, P = any>(data: P, options?: DataOpts): Promise<Result<R>> {
    return this.query.post(data, options);
  }
  get<R = any, P = any>(data: P, options?: DataOpts): Promise<Result<R>> {
    return this.query.get(data, options);
  }
}

export class ClientQuery extends Query {
  constructor(opts?: QueryOpts) {
    super({ ...opts, url: opts?.url || '/client/router' });
  }
}
