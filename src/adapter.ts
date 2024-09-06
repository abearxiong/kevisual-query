type AdapterOpts = {
  url: string;
  headers?: Record<string, string>;
  body: Record<string, any>;
};
export const adapter = async (opts: AdapterOpts) => {
  return fetch(opts.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token'),
      ...opts.headers,
    },
    body: JSON.stringify(opts.body),
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
      return {
        code: 500,
      };
    });
};
