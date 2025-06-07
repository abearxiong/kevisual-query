export const methods = ['GET', 'POST'] as const;
export type Method = (typeof methods)[number];

type SimpleObject = Record<string, any>;
export type AdapterOpts = {
  url?: string;
  headers?: Record<string, string>;
  body?: Record<string, any> | FormData; // body 可以是对象、字符串或 FormData
  timeout?: number;
  method?: Method;
  isBlob?: boolean; // 是否返回 Blob 对象
  isPostFile?: boolean; // 是否为文件上传
};
export const isTextForContentType = (contentType: string | null) => {
  if (!contentType) return false;
  const textTypes = ['text/', 'xml', 'html', 'javascript', 'css', 'csv', 'plain', 'x-www-form-urlencoded'];
  return textTypes.some((type) => contentType.includes(type));
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
  const isBlob = opts.isBlob || false; // 是否返回 Blob 对象
  const isPostFile = opts.isPostFile || false; // 是否为文件上传
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
    url.search = new URLSearchParams(opts.body as SimpleObject).toString();
  }
  let body: string | FormData | undefined = undefined;
  if (isGet) {
    body = undefined;
  } else if (isPostFile) {
    body = opts.body as FormData; // 如果是文件上传，直接使用 FormData
  } else {
    body = JSON.stringify(opts.body); // 否则将对象转换为 JSON 字符串
  }
  return fetch(url, {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
    signal,
    ...overloadOpts,
    body: body,
  })
    .then(async (response) => {
      // 获取 Content-Type 头部信息
      const contentType = response.headers.get('Content-Type');
      if (isBlob) {
        return await response.blob(); // 直接返回 Blob 对象
      }
      const isJson = contentType && contentType.includes('application/json');
      // 判断返回的数据类型
      if (isJson) {
        return await response.json(); // 解析为 JSON
      } else if (isTextForContentType(contentType)) {
        return {
          code: 200,
          status: response.status,
          data: await response.text(), // 直接返回文本内容
        };
      } else {
        return response;
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
