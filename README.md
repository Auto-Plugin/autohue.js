<p align="center">
  <a target="_blank" href="#">
  <img alt="autohue" src="./public/logo.svg" width="300">
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

参数说明：

- threshold：簇阈值，即取均色时的范围大小，一般在 8-12 左右，推荐默认 10 即可，当需要取精准边缘颜色时，可以单独设置 left \ right 等 为 1，支持两种格式：number | { primary?: number; left?: number; right?: number; top?: number; bottom?: number }
- maxSize：降采样后的图片大小，如传入 100，图片将被压缩到最长边是 100，另一边等比例缩放，值越小处理速度越快，但是精度会越低。

## 在线演示

[在线演示](https://auto-plugin.github.io/autohue.js/)
