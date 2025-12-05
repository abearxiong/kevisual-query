import { adapter } from './adapter.ts';
import { QueryWs, QueryWsOpts } from './ws.ts';
import { Query } from './query.ts';
import { wrapperError } from './query.ts';

export { QueryOpts, QueryWs, Query, QueryWsOpts, adapter, wrapperError };

export type { DataOpts, Result, Data } from './query.ts';

type QueryOpts = {
  url?: string;
  adapter?: typeof adapter;
  headers?: Record<string, string>;
  timeout?: number;
};

/**
 * 前端调用后端QueryRouter, 封装 beforeRequest 和 wss
 */
export class QueryClient extends Query {
  tokenName: string;
  storage: Storage;
  token: string;
  constructor(opts?: QueryOpts & { tokenName?: string; storage?: Storage; io?: boolean }) {
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
    if (opts?.io) {
      this.createWs();
    }
  }
  createWs(opts?: QueryWsOpts) {
    this.qws = new QueryWs({ url: this.url, ...opts });
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
// 移除默认生成的实例
// export const client = new QueryClient();
