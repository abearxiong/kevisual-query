import { createStore, StoreApi } from 'zustand/vanilla';
import { parseWsUrl } from './utils.ts';

type QueryWsStore = {
  connected: boolean;
  status: 'connecting' | 'connected' | 'disconnected';
  setConnected: (connected: boolean) => void;
  setStatus: (status: QuerySelectState) => void;
};
export type QuerySelectState = 'connecting' | 'connected' | 'disconnected';
export type QueryWsStoreListener = (newState: QueryWsStore, oldState: QueryWsStore) => void;
type QueryWsOpts = {
  url?: string;
  store?: StoreApi<QueryWsStore>;
  ws?: WebSocket;
};
export type WsSend<T = any, U = any> = (data: T, opts?: { isJson?: boolean; wrapper?: (data: T) => U }) => any;
export type WsOnMessage<T = any, U = any> = (fn: (data: U, event: MessageEvent) => void, opts?: { isJson?: boolean; selector?: (data: T) => U }) => any;

export class QueryWs {
  url: string;
  store: StoreApi<QueryWsStore>;
  ws: WebSocket;
  constructor(opts?: QueryWsOpts) {
    const url = opts?.url || '/api/router';
    if (opts?.store) {
      this.store = opts.store;
    } else {
      const store = createStore<QueryWsStore>((set) => ({
        connected: false,
        status: 'connecting',
        setConnected: (connected) => set({ connected }),
        setStatus: (status) => set({ status }),
      }));
      this.store = store;
    }
    const wsUrl = parseWsUrl(url);
    if (opts?.ws && opts.ws instanceof WebSocket) {
      this.ws = opts.ws;
    } else {
      this.ws = new WebSocket(wsUrl);
    }
    this.connect();
  }
  /**
   * 连接 WebSocket
   */
  async connect(opts?: { timeout?: number }) {
    const store = this.store;
    const connected = store.getState().connected;
    if (connected) {
      return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {
      const ws = this.ws || new WebSocket(this.url);
      const timeout = opts?.timeout || 5 * 60 * 1000; // 默认 2 分钟
      let timer = setTimeout(() => {
        console.error('WebSocket 连接超时');
        reject('timeout');
      }, timeout);
      ws.onopen = () => {
        store.getState().setConnected(true);
        store.getState().setStatus('connected');
        resolve(true);
        clearTimeout(timer);
      };
      ws.onclose = () => {
        store.getState().setConnected(false);
        store.getState().setStatus('disconnected');
        this.ws = null;
      };
    });
  }

  listenConnect(callback: () => void) {
    const store = this.store;
    const { connected } = store.getState();
    if (connected) {
      callback();
      return;
    }
    const subscriptionOne = (selector: (state: QueryWsStore) => QueryWsStore['connected'], listener: QueryWsStoreListener) => {
      const unsubscribe = store.subscribe((newState: any, oldState: any) => {
        if (selector(newState) !== selector(oldState)) {
          listener(newState, oldState);
          unsubscribe();
        }
      });
      return unsubscribe;
    };
    const cancel = subscriptionOne(
      (state) => state.connected,
      () => {
        callback();
      },
    );
    return cancel;
  }
  onMessage<T = any, U = any>(
    fn: (data: U, event: MessageEvent) => void,
    opts?: {
      isJson?: boolean;
      selector?: (data: T) => U;
    },
  ) {
    const ws = this.ws;
    const isJson = opts?.isJson ?? true;
    const selector = opts?.selector;
    const parseIfJson = (data: string) => {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    };
    const listener = (event: MessageEvent) => {
      const received = parseIfJson(event.data);
      if (typeof received === 'string' && !isJson) {
        fn(received as any, event);
      } else if (typeof received === 'object' && isJson) {
        fn(selector ? selector(received) : received, event);
      } else {
        // 过滤掉的数据
      }
    };
    ws.addEventListener('message', listener);
    return () => {
      ws.removeEventListener('message', listener);
    };
  }
  close() {
    const ws = this.ws;
    const store = this.store;
    ws?.close?.();
    this.ws = null;
    store.getState().setConnected(false);
    store.getState().setStatus('disconnected');
  }
  send<T = any, U = any>(data: T, opts?: { isJson?: boolean; wrapper?: (data: T) => U }) {
    const ws = this.ws;
    const isJson = opts?.isJson ?? true;
    const wrapper = opts?.wrapper;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open');
      return;
    }
    if (isJson) {
      ws.send(JSON.stringify(wrapper ? wrapper(data) : data));
    } else {
      ws.send(data as string);
    }
  }
  getOpen() {
    if (!this.ws) {
      return false;
    }
    return this.ws.readyState === WebSocket.OPEN;
  }
}
