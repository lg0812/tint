const Jimp = require('jimp')

const convertColor = require('replace-color/src/utils/convert-color')
const getDelta = require('replace-color/src/utils/get-delta')
const isNumber = require('replace-color/src/utils/is-number')
const ReplaceColorError = require('replace-color/src/utils/replace-color-error')
const validateColors = require('replace-color/src/utils/validate-colors')

const replaceColor = ({
  image,
  colors,
  formula = 'E00',
  deltaE = 2.3
} = {}, callback) => {
  if (callback) {
    if (typeof callback !== 'function') {
      throw new ReplaceColorError('PARAMETER_INVALID', 'callback')
    }
  }

  return new Promise((resolve, reject) => {
    callback = callback || ((err, jimpObject) => {
      if (err) return reject(err)
      return resolve(jimpObject)
    })

    if (!image) {
      return callback(new ReplaceColorError('PARAMETER_REQUIRED', 'options.image'))
    }

    colors.forEach((color) => {
      var colorsValidationError = validateColors(color)
      if (colorsValidationError) {
        return callback(new ReplaceColorError(colorsValidationError.code, colorsValidationError.field))
      }
    })


    if (!(typeof formula === 'string' && ['E76', 'E94', 'E00'].includes(formula))) {
      return callback(new ReplaceColorError('PARAMETER_INVALID', 'options.formula'))
    }

    if (!(isNumber(deltaE) && deltaE >= 0 && deltaE <= 100)) {
      return callback(new ReplaceColorError('PARAMETER_INVALID', 'options.deltaE'))
    }

    const read = Jimp.read || Jimp.default.read
    
    read(image)
      .then((jimpObject) => {

        colors.forEach((color) => {
        const targetLABColor = convertColor(color.type, 'lab', color.targetColor)
        const replaceRGBColor = convertColor(color.type, 'rgb', color.replaceColor)

        jimpObject.scan(0, 0, jimpObject.bitmap.width, jimpObject.bitmap.height, (x, y, idx) => {
          const currentLABColor = convertColor('rgb', 'lab', [
            jimpObject.bitmap.data[idx],
            jimpObject.bitmap.data[idx + 1],
            jimpObject.bitmap.data[idx + 2]
          ])

          if (getDelta(currentLABColor, targetLABColor, formula) <= deltaE) {
            jimpObject.bitmap.data[idx] = replaceRGBColor[0]
            jimpObject.bitmap.data[idx + 1] = replaceRGBColor[1]
            jimpObject.bitmap.data[idx + 2] = replaceRGBColor[2]
            if (replaceRGBColor[3] !== null) jimpObject.bitmap.data[idx + 3] = replaceRGBColor[3]
          }
        })
      })

        callback(null, jimpObject)
      })
      .catch(callback)
  })
}

const sideEffect = async (image, options = {}) => {
  console.log('form sideEffect, options 配置：', opitons)
  
  const {name , opacity, mask, maskOpacity} = options
  if(opacity !== undefined) {
    image =image.opacity(opacity)
  }
  
  if(mask !== undefined && mask !== '') {
    const {width, height} = image.bitmap
    const color = Jimp.cssColorToHex(mask)
    const maskLayer = new Jimp(width, height, color)
    image = image.composite(maskLayer.opacity(maskOpacity || 1), 0, 0)
  }
  
  return image;
}

module.exports = {replaceColor, sideEffect}
