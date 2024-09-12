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
    payload?: Record<string, any>;
    [key: string]: any;
};
type Result<S = any> = {
    code: number;
    data?: S;
    message?: string;
    success: boolean;
};
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
 */
export declare class Query {
    adapter: typeof adapter;
    url: string;
    beforeRequest?: Fn;
    afterResponse?: (result: Result) => Promise<any>;
    headers?: Record<string, string>;
    timeout?: number;
    constructor(opts: QueryOpts);
    get<T, S>(params: Record<string, any> & Data & T, options?: DataOpts): Promise<Result<S>>;
    post<T, S>(body: Record<string, any> & Data & T, options?: DataOpts): Promise<Result<S>>;
    before(fn: Fn): void;
    after(fn: (result: Result) => Promise<any>): void;
}
export { adapter };
