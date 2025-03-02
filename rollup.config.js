// rollup.config.js

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { dts } from 'rollup-plugin-dts';
/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: 'src/index.ts', // TypeScript 入口文件
    output: {
      file: 'dist/query-browser.js', // 输出文件
      format: 'es', // 输出格式设置为 ES 模块
    },
    plugins: [
      resolve(), // 使用 @rollup/plugin-node-resolve 解析 node_modules 中的模块
      typescript(), // 使用 @rollup/plugin-typescript 处理 TypeScript 文件
    ],
  },
  {
    input: 'src/index.ts', // TypeScript 入口文件
    output: {
      file: 'dist/query-browser.d.ts', // 输出文件
      format: 'es', // 输出格式设置为 ES 模块
    },
    plugins: [dts()],
  },
  {
    input: 'src/query.ts',
    output: {
      file: 'dist/query.js',
      format: 'es',
    },
    moduleSideEffects: false, // 确保无副作用的模块能被完全 tree-shake
    propertyReadSideEffects: false,

    plugins: [resolve(), typescript()],
  },
  {
    input: 'src/query.ts',
    output: {
      file: 'dist/query.d.ts',
      format: 'es',
    },

    plugins: [dts()],
  },
  {
    input: 'src/ws.ts', // TypeScript 入口文件
    output: {
      file: 'dist/query-ws.js', // 输出文件
      format: 'es', // 输出格式设置为 ES 模块
    },
    plugins: [
      resolve(), // 使用 @rollup/plugin-node-resolve 解析 node_modules 中的模块
      typescript(), // 使用 @rollup/plugin-typescript 处理 TypeScript 文件
    ],
  },
  {
    input: 'src/ws.ts', // TypeScript 入口文件
    output: {
      file: 'dist/query-ws.d.ts', // 输出文件
      format: 'es', // 输出格式设置为 ES 模块
    },
    plugins: [dts()],
  },
  {
    input: 'src/adapter.ts',
    output: {
      file: 'dist/query-adapter.js',
      format: 'es',
    },
    plugins: [resolve(), typescript()],
  },
  {
    input: 'src/adapter.ts', // TypeScript 入口文件
    output: {
      file: 'dist/query-adapter.d.ts', // 输出文件
      format: 'es', // 输出格式设置为 ES 模块
    },
    plugins: [dts()],
  },
  {
    input: 'src/query-ai.ts',
    output: {
      file: 'dist/query-ai.js',
      format: 'es',
    },
    plugins: [resolve(), typescript()],
  },
  {
    input: 'src/query-ai.ts', // TypeScript 入口文件
    output: {
      file: 'dist/query-ai.d.ts', // 输出文件
      format: 'es', // 输出格式设置为 ES 模块
    },
    plugins: [dts()],
  },
];
