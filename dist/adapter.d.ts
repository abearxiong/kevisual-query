type AdapterOpts = {
    url: string;
    headers?: Record<string, string>;
    body?: Record<string, any>;
    timeout?: number;
};
export declare const adapter: (opts: AdapterOpts) => Promise<any>;
export {};
