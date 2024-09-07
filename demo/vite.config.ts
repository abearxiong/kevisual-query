import { defineConfig } from 'vite';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  server: {
    port: 6102,
    // host: '::',
    proxy: {
      '/api/router': {
        target: 'http://127.0.0.1:3003',
        changeOrigin: true,
      },
    },
  },
  // define: {
  //   DEV_SERVER: JSON.stringify(isDev),
  // },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      // output: {
      //   dir: 'dist',
      //   format: 'esm',
      //   entryFileNames: (chunkInfo) => {
      //     // 判断当前chunk是否是从node_modules导入的
      //     if (chunkInfo.isEntry && chunkInfo.facadeModuleId.includes('node_modules')) {
      //       return 'vendor/[name].[hash].js'; // 依赖输出到vendor文件夹
      //     }
      //     return 'assets/[name].[hash].js'; // 自己的代码输出到assets文件夹
      //   },
      // },
      output: {
        // chunkFileNames: (chunkInfo) => {
        //   // 检查该 chunk 是否来自 node_modules
        //   if (chunkInfo.isEntry && chunkInfo.facadeModuleId.includes('node_modules')) {
        //     // 提取包名，通常 node_modules 的路径第二部分是包名
        //     const packageName = chunkInfo.facadeModuleId.split(path.sep)[1];
        //     // 如果包名以 '@' 开头，处理作用域包的情况
        //     if (packageName.startsWith('@')) {
        //       const parts = packageName.split(path.sep);
        //       return `vendor/${parts[0]}/${parts[1]}/[name].[hash].js`;
        //     }
        //     return `vendor/${packageName}/[name].[hash].js`;
        //   }
        //   return 'assets/[name].[hash].js';
        // },
        manualChunks: (id) => {
          // if (id.includes('node_modules')) {
          //   // 提取包名，适用于 node_modules 路径
          //   const parts = id.split(path.sep);
          //   const packageName = parts[parts.indexOf('node_modules') + 1];
          //   // 返回一个 unique chunk 名，这里以包名作为 chunk 名
          //   return `vendor/${packageName}`;
          // }
          if (id.includes('node_modules')) {
            return 'vendor'; // 为node_modules下的模块指定单独的chunk名，并放在vendor目录
          }
        },
      },
    },
  },
});
