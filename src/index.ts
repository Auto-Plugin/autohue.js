export interface AutoHueResult {
  primaryColor: string // 占比最大的颜色
  secondaryColor: string // 第二大颜色
  backgroundColor: {
    top: string
    right: string
    bottom: string
    left: string
  }
}

interface Cluster {
  count: number
  sumRgb: [number, number, number]
  sumLab: [number, number, number]
  averageRgb: [number, number, number]
  averageLab: [number, number, number]
}
type thresholdObj = { primary?: number; left?: number; right?: number; top?: number; bottom?: number }
interface autoColorPickerOptions {
  /**
   * - 降采样后的最大尺寸（默认 100px）
   * - 降采样后的图片尺寸不会超过该值，可根据需求调整
   * - 降采样后的图片尺寸越小，处理速度越快，但可能会影响颜色提取的准确性
   **/
  maxSize?: number
  /**
   * - Lab 距离阈值（默认 10）
   * - 低于此值的颜色归为同一簇，建议 8~12
   * - 值越大，颜色越容易被合并，提取的颜色越少
   * - 值越小，颜色越容易被区分，提取的颜色越多
   * - 传入 number | { primary?: number; left?: number; right?: number; top?: number; bottom?: number }
   **/
  threshold?: number | thresholdObj
}

// 将 sRGB 转换为 Lab 色彩空间
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let R = r / 255,
    G = g / 255,
    B = b / 255
  R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92
  G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92
  B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92

  let X = R * 0.4124 + G * 0.3576 + B * 0.1805
  let Y = R * 0.2126 + G * 0.7152 + B * 0.0722
  let Z = R * 0.0193 + G * 0.1192 + B * 0.9505

  X = X / 0.95047
  Y = Y / 1.0
  Z = Z / 1.08883

  const f = (t: number) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116)
  const fx = f(X)
  const fy = f(Y)
  const fz = f(Z)
  const L = 116 * fy - 16
  const a = 500 * (fx - fy)
  const bVal = 200 * (fy - fz)
  return [L, a, bVal]
}

// 计算 Lab 空间的欧氏距离
function labDistance(lab1: [number, number, number], lab2: [number, number, number]): number {
  const dL = lab1[0] - lab2[0]
  const da = lab1[1] - lab2[1]
  const db = lab1[2] - lab2[2]
  return Math.sqrt(dL * dL + da * da + db * db)
}

// 将 [r, g, b] 数组转换为 16 进制字符串
function rgbToHex(rgb: [number, number, number]): string {
  return (
    '#' +
    rgb
      .map((v) => {
        const hex = Math.round(v).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

// 加载图片（支持传入 URL 或 HTMLImageElement）
function loadImage(imageSource: HTMLImageElement | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let img: HTMLImageElement
    if (typeof imageSource === 'string') {
      img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = imageSource
    } else {
      img = imageSource
    }
    if (img.complete) {
      resolve(img)
    } else {
      img.onload = () => resolve(img)
      img.onerror = (err) => reject(err)
    }
  })
}

// 利用 Canvas 对图片进行降采样，返回 ImageData 对象
function getImageDataFromImage(img: HTMLImageElement, maxSize: number = 100): ImageData {
  const canvas = document.createElement('canvas')
  let width = img.naturalWidth
  let height = img.naturalHeight
  if (width > maxSize || height > maxSize) {
    const scale = Math.min(maxSize / width, maxSize / height)
    width = Math.floor(width * scale)
    height = Math.floor(height * scale)
  }
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法获取 Canvas 上下文')
  }
  ctx.drawImage(img, 0, 0, width, height)
  return ctx.getImageData(0, 0, width, height)
}

/**
 * 对满足条件的像素进行聚类
 * @param imageData 图片像素数据
 * @param condition 判断像素是否属于指定区域的条件函数（参数 x, y）
 * @param threshold Lab 距离阈值，低于此值的颜色归为同一簇，建议 8~12
 */
function clusterPixelsByCondition(imageData: ImageData, condition: (x: number, y: number) => boolean, threshold: number = 10): Cluster[] {
  const clusters: Cluster[] = []
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!condition(x, y)) continue
      const index = (y * width + x) * 4
      if (data[index + 3] === 0) continue // 忽略透明像素
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      const lab = rgbToLab(r, g, b)
      let added = false
      for (const cluster of clusters) {
        const d = labDistance(lab, cluster.averageLab)
        if (d < threshold) {
          cluster.count++
          cluster.sumRgb[0] += r
          cluster.sumRgb[1] += g
          cluster.sumRgb[2] += b
          cluster.sumLab[0] += lab[0]
          cluster.sumLab[1] += lab[1]
          cluster.sumLab[2] += lab[2]
          cluster.averageRgb = [cluster.sumRgb[0] / cluster.count, cluster.sumRgb[1] / cluster.count, cluster.sumRgb[2] / cluster.count]
          cluster.averageLab = [cluster.sumLab[0] / cluster.count, cluster.sumLab[1] / cluster.count, cluster.sumLab[2] / cluster.count]
          added = true
          break
        }
      }
      if (!added) {
        clusters.push({
          count: 1,
          sumRgb: [r, g, b],
          sumLab: [lab[0], lab[1], lab[2]],
          averageRgb: [r, g, b],
          averageLab: [lab[0], lab[1], lab[2]]
        })
      }
    }
  }
  return clusters
}
function __handleAutoHueOptions(options?: autoColorPickerOptions) {
  if (!options) options = {} as autoColorPickerOptions
  const { maxSize = 100 } = options
  let threshold = options.threshold || 10
  if (typeof threshold === 'number') {
    threshold = { primary: threshold, left: threshold, right: threshold, top: threshold, bottom: threshold }
  } else {
    threshold = {
      primary: threshold.primary || 10,
      left: threshold.left || 10,
      right: threshold.right || 10,
      top: threshold.top || 10,
      bottom: threshold.bottom || 10
    }
  }
  return { maxSize, threshold }
}

/**
 * 主函数：根据图片自动提取颜色
 * @param imageSource 图片 URL 或 HTMLImageElement
 * @returns 返回包含主要颜色、次要颜色和背景色对象（上、右、下、左）的结果
 */
export default async function colorPicker(imageSource: HTMLImageElement | string, options?: autoColorPickerOptions): Promise<AutoHueResult> {
  const { maxSize, threshold } = __handleAutoHueOptions(options)
  const img = await loadImage(imageSource)
  // 降采样（最大尺寸 100px，可根据需求调整）
  const imageData = getImageDataFromImage(img, maxSize)

  // 对全图所有像素进行聚类
  let clusters = clusterPixelsByCondition(imageData, () => true, threshold.primary)
  clusters.sort((a, b) => b.count - a.count)
  const primaryCluster = clusters[0]
  const secondaryCluster = clusters.length > 1 ? clusters[1] : clusters[0]
  const primaryColor = rgbToHex(primaryCluster.averageRgb)
  const secondaryColor = rgbToHex(secondaryCluster.averageRgb)

  // 定义边缘宽度（单位像素）
  const margin = 10
  const width = imageData.width
  const height = imageData.height

  // 分别对上、右、下、左边缘进行聚类
  const topClusters = clusterPixelsByCondition(imageData, (_x, y) => y < margin, threshold.top)
  topClusters.sort((a, b) => b.count - a.count)
  const topColor = topClusters.length > 0 ? rgbToHex(topClusters[0].averageRgb) : primaryColor

  const bottomClusters = clusterPixelsByCondition(imageData, (_x, y) => y >= height - margin, threshold.bottom)
  bottomClusters.sort((a, b) => b.count - a.count)
  const bottomColor = bottomClusters.length > 0 ? rgbToHex(bottomClusters[0].averageRgb) : primaryColor

  const leftClusters = clusterPixelsByCondition(imageData, (x, _y) => x < margin, threshold.left)
  leftClusters.sort((a, b) => b.count - a.count)
  const leftColor = leftClusters.length > 0 ? rgbToHex(leftClusters[0].averageRgb) : primaryColor

  const rightClusters = clusterPixelsByCondition(imageData, (x, _y) => x >= width - margin, threshold.right)
  rightClusters.sort((a, b) => b.count - a.count)
  const rightColor = rightClusters.length > 0 ? rgbToHex(rightClusters[0].averageRgb) : primaryColor

  return {
    primaryColor,
    secondaryColor,
    backgroundColor: {
      top: topColor,
      right: rightColor,
      bottom: bottomColor,
      left: leftColor
    }
  }
}
