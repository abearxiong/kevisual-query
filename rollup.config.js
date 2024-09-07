// rollup.config.js

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: 'src/index.ts', // TypeScript 入口文件
    output: {
      file: 'dist/index.js', // 输出文件
      format: 'es', // 输出格式设置为 ES 模块
    },
    plugins: [
      resolve(), // 使用 @rollup/plugin-node-resolve 解析 node_modules 中的模块
      typescript({
        allowImportingTsExtensions: true,
        noEmit: true,
      }), // 使用 @rollup/plugin-typescript 处理 TypeScript 文件
    ],
  },
  {
    input: 'src/node-adapter.ts', // TypeScript 入口文件
    output: {
      file: 'dist/node-adapter.js', // 输出文件
      format: 'es', // 输出格式设置为 ES 模块
    },
    plugins: [
      resolve(), // 使用 @rollup/plugin-node-resolve 解析 node_modules 中的模块
      typescript({
        allowImportingTsExtensions: true,
        noEmit: true,
      }), // 使用 @rollup/plugin-typescript 处理 TypeScript 文件
    ],
  },
];
