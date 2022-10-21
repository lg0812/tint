const {forEach} = require("lodash")
const sharp = require('sharp')
const Jimp = require("jimp");
const {sideEffect} = require("./replaceMultipleColors")

const tintSVG = async ({svgStr, colors, options = {}}) => {
    try {
        const start = Date.now();
        const found = svgStr.match(/\$\d+/g)
        console.log('from tintSVG, match result:', found, colors.length)

        if ((found || []).length > colors.length && colors.length !== 1) {
            console.error("from tintSVG, 占位符个数 > 颜色值个数，请检查数据！", svgStr, colors)
            return svgStr
        }

        forEach(colors, (color, index) => {
            if (color) {
                if (/^#[a-fA-F\d+]{8}$/.test(color)) {
                    color = '#' + color.slice(3)
                }

                svgStr = svgStr.replace(`$${index}`, color)
            } else {
                console.log('skip invalid color!')
            }
        })

        const buffer = await sharp(Buffer.from(svgStr)).png().toBuffer()

        const read = Jimp.read || Jimp.default.read
        const image = await sideEffect(await read(buffer), options)
        return await image.getBase64Async('image/png')
    } catch (e) {
        console.log('from tintSVG, svg convert to png exception: ', e)
    }
    return ''
}

module.exports = {tintSVG}
