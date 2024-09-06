import { adapter } from './adapter';

type Fn = (opts: { url?: string; headers?: Record<string, string>; body?: Record<string, any>; [key: string]: any }) => Promise<Record<string, any>>;
type QueryOpts = {
  url?: string;
  adapter?: typeof adapter;
};
export class Query {
  adapter: typeof adapter;
  url: string;
  beforeRequest?: Fn;
  headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + localStorage.getItem('token'),
  };
  constructor(opts: QueryOpts) {
    this.adapter = opts.adapter || adapter;
    this.url = opts.url || '/api/router';
  }
  async get(params: Record<string, any>) {
    return this.post(params);
  }
  async post(body: Record<string, any>) {
    const req = {
      url: this.url,
      headers: this.headers,
      body,
    };
    if (this.beforeRequest) {
      await this.beforeRequest(req);
    }
    return this.adapter(req);
  }
  before(fn: Fn) {
    this.beforeRequest = fn;
  }
}
