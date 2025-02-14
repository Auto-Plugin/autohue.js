import { defineConfig, Plugin } from 'rolldown';
import { terser } from 'rollup-plugin-terser'
import banner from 'rollup-plugin-banner2'
import packageJson from './package.json'


const bannerContent = `
/**
 * @name: ${packageJson.name}
 * @author: ${packageJson.author}
 * @version: ${packageJson.version}
 * @description: ${packageJson.description}
 * @license: ${packageJson.license}
 */`

export default defineConfig({
  input: './src/index.ts',
  output: [
    {
      format: 'esm',
      file: './dist/autohue.esm.js',
      name: 'autohue',
      esModule: true
    },
    {
      format: 'cjs',
      file: './dist/autohue.cjs.js',
      esModule: true,
      name: 'autohue',
    },
    {
      format: 'umd',
      file: './dist/autohue.umd.js',
      name: 'autohue',
    },
    {
      format: 'iife',
      file: './dist/autohue.iife.js',
      name: 'autohue',
    },
    {
      format: 'iife',
      file: './dist/autohue.min.js',
      plugins: [terser() as Plugin],
    },
  ],
  plugins: [
    banner(() => bannerContent) as Plugin,
  ]
})