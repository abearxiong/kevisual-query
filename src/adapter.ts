type AdapterOpts = {
  url: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  timeout?: number;
};
export const adapter = async (opts: AdapterOpts) => {
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