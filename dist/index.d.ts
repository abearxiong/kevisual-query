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
type DataOpts = Partial<QueryOpts> & {
    beforeRequest?: Fn;
};
export declare class Query {
    adapter: typeof adapter;
    url: string;
    beforeRequest?: Fn;
    headers?: Record<string, string>;
    timeout?: number;
    constructor(opts: QueryOpts);
    get<T>(params: Record<string, any> & Data & T, options?: DataOpts): Promise<any>;
    post<T>(body: Record<string, any> & Data & T, options?: DataOpts): Promise<any>;
    before(fn: Fn): void;
}
export { adapter };
