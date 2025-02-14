import { defineConfig } from 'rolldown'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import path from 'path'

function resolveRoot(dir) {
  return path.resolve(__dirname, dir)
}

export default defineConfig({
  input: resolveRoot('./dev/index.ts'),
  output: [
    {
      format: 'iife',
      file: './dev/autohue.iife.js',
      name: 'autohue',
    },
  ],
  plugins: [
    serve({
      open: true,           // 自动打开浏览器
      contentBase: 'dev',  // 静态文件的根目录
      port: 30001,           // 服务器端口
    }),
    livereload({
      watch: 'dev',        // 监听文件变化
    }),
  ],
})