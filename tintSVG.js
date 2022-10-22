const {forEach, join} = require("lodash")
const sharp = require('sharp')
const Jimp = require("jimp");
const {sideEffect} = require("./replaceMultipleColors")

const tintSVG = async ({
                         svgStr = '',
                         colors,
                         options = {}
                       }) => {
  try {
    const start = Date.now();

    forEach(colors, (color, index) => {
      if (color) {
        if (/^#[a-fA-F\d]{8}$/.test(color)) {
          color = '#' + color.slice(3)
        }

        svgStr = svgStr.replaceAll(`$${index}`, color)
      } else {
        console.log('from tintSVG, skip invalid color!')
      }
    })

    const found = svgStr.match(/\$\d+/g)
    if ((found || []).length > 0) {
      throw new Error(`from tintSVG, 占位符未完全替换，请检查数据！ svgStr: ${svgStr}, colors: ${join(colors)}`)
    }

    const buffer = await sharp(Buffer.from(svgStr)).png().toBuffer()

    const read = Jimp.read || Jimp.default.read
    const image = await sideEffect(await read(buffer), options)
    console.log('from tintSVG, 执行时间：', Date.now() - start)
    return await image.getBase64Async('image/png')
  } catch (e) {
    console.log('from tintSVG, svg convert to png exception: ', e)
  }
  return ''
}

module.exports = {tintSVG}
