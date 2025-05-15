export const methods = ['GET', 'POST'] as const;
export type Method = (typeof methods)[number];
export type AdapterOpts = {
  url: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  timeout?: number;
  method?: Method;
};

/**
 *
 * @param opts
 * @param overloadOpts 覆盖fetch的默认配置
 * @returns
 */
export const adapter = async (opts: AdapterOpts, overloadOpts?: RequestInit) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const timeout = opts.timeout || 60000 * 3; // 默认超时时间为 60s * 3
  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);
  let method = overloadOpts?.method || opts.method || 'POST';
  let origin = '';
  let url: URL;
  if (opts?.url?.startsWith('http')) {
    url = new URL(opts.url);
  } else {
    origin = window?.location?.origin || 'http://localhost:51015';
    url = new URL(opts.url, origin);
  }
  const isGet = method === 'GET';
  if (isGet) {
    url.search = new URLSearchParams(opts.body).toString();
  }
  return fetch(url, {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
    signal,
    ...overloadOpts,
    body: isGet ? undefined : JSON.stringify(opts.body),
  })
    .then((response) => {
      // 获取 Content-Type 头部信息
      const contentType = response.headers.get('Content-Type');
      // 判断返回的数据类型
      if (contentType && contentType.includes('application/json')) {
        return response.json(); // 解析为 JSON
      } else {
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
 * adapter
 */
export const queryFetch = adapter;
