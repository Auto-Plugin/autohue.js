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
      file: './dist/autotint.esm.js',
      name: 'autotint',
      esModule: true
    },
    {
      format: 'cjs',
      file: './dist/autotint.cjs.js',
      esModule: true,
      name: 'autotint',
    },
    {
      format: 'umd',
      file: './dist/autotint.umd.js',
      name: 'autotint',
    },
    {
      format: 'iife',
      file: './dist/autotint.iife.js',
      name: 'autotint',
    },
    {
      format: 'iife',
      file: './dist/autotint.min.js',
      plugins: [terser() as Plugin],
    },
  ],
  plugins: [
    banner(() => bannerContent) as Plugin,
  ]
})