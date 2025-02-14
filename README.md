<p align="center">
  <a target="_blank" href="#">
  <img alt="autohue" src="https://auto-plugin.github.io/index/dependens/ico.svg" width="300">
  </a>
</p>

<p align="center">
  <h2 align="center">autohue.js</h2>
</p>

一个自动提取图片主题色让图片和背景融为一体的工具

## 安装

```shell
pnpm i autohue.js
```

## 使用

```js
import autohue from 'autohue.js'

autohue(url, {
  threshold: {
    primary: 10,
    left: 1,
    bottom: 12
  },
  maxSize: 50
})
  .then((result) => {
    // 使用 console.log 打印出色块元素s
    console.log(`%c${result.primaryColor}`, 'color: #fff; background: ' + result.primaryColor, 'main')
    console.log(`%c${result.secondaryColor}`, 'color: #fff; background: ' + result.secondaryColor, 'sub')
    console.log(`%c${result.backgroundColor.left}`, 'color: #fff; background: ' + result.backgroundColor.left, 'bg-left')
    console.log(`%c${result.backgroundColor.right}`, 'color: #fff; background: ' + result.backgroundColor.right, 'bg-right')
    console.log(`%clinear-gradient to right`, 'color: #fff; background: linear-gradient(to right, ' + result.backgroundColor.left + ', ' + result.backgroundColor.right + ')', 'bg')
    bg.value = `linear-gradient(to right, ${result.backgroundColor.left}, ${result.backgroundColor.right})`
  })
  .catch((err) => console.error(err))
```
