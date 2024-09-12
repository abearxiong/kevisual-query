const adapter = async (opts) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeout = opts.timeout || 60000; // 默认超时时间为 60s
    const timer = setTimeout(() => {
        controller.abort();
    }, timeout);
    return fetch(opts.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...opts.headers,
        },
        body: JSON.stringify(opts.body),
        signal,
    })
        .then((response) => {
        // 获取 Content-Type 头部信息
        const contentType = response.headers.get('Content-Type');
        // 判断返回的数据类型
        if (contentType && contentType.includes('application/json')) {
            return response.json(); // 解析为 JSON
        }
        else {
            return response.text(); // 解析为文本
        }
    })
        .catch((err) => {
        if (err.name === 'AbortError') {
            console.log('Request timed out and was aborted');
        }
        console.error(err);
        return {
            code: 500,
        };
    })
        .finally(() => {
        clearTimeout(timer);
    });
};

/**
 * const query = new Query();
 * const res = await query.post({
 *   path: 'demo',
 *   key: '1',
 *  });
 */
class Query {
    adapter;
    url;
    beforeRequest;
    afterResponse;
    headers;
    timeout;
    constructor(opts) {
        this.adapter = opts.adapter || adapter;
        this.url = opts.url || '/api/router';
        this.headers = opts.headers || {
            'Content-Type': 'application/json',
        };
        this.timeout = opts.timeout || 60000; // 默认超时时间为 60s
    }
    async get(params, options) {
        return this.post(params, options);
    }
    async post(body, options) {
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
    before(fn) {
        this.beforeRequest = fn;
    }
    after(fn) {
        this.afterResponse = fn;
    }
}

export { Query, adapter };
