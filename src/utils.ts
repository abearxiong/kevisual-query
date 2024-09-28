export const parseUrl = (url: string) => {
  try {
    new URL(url);
  } catch (e) {
    const _url = new URL(url, location.origin);
    return _url.href;
  }
};

export const parseWsUrl = (url: string) => {
  try {
    new URL(url);
    return url;
  } catch (e) {
    const _url = new URL(url, location.origin);
    if (_url.protocol === 'http:') {
      _url.protocol = 'ws:';
    }
    if (_url.protocol === 'https:') {
      _url.protocol = 'wss:';
    }
    return _url.href;
  }
};
