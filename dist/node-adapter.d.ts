type AdapterOpts = {
    url: string;
    headers?: Record<string, string>;
    body?: Record<string, any>;
};
export declare const nodeAdapter: (opts: AdapterOpts) => Promise<any>;
export declare const adapter: (opts: AdapterOpts) => Promise<any>;
export {};
