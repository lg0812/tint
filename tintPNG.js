const {get, map, replace} = require('lodash')
const {replaceColor, sideEffect} = require('./replaceMultipleColors')

const tintPNG = async ({
  base64,
  targetColors = [],
  replaceColors = [],
  options = {}
}) => {
 const start = Date.now(); 
  const {name} = options;
  const buffer = Buffer.from(
    replace(base64, /^data:image\/\w+;base64,/, ''),
    'base64'
  )
  
  if(targetColors.length !== replaceColors.length) {
    console.warn(
      'from tintPNG, targetColors 与 replaceColors 长度不一致，图片名：',
      name,
      targetColors,
      replaceColors
    )
  }
  
  try {
    let image = await replaceColor(
      {
        image: buffer,
        colors: map(targetColors, (item, index) => {
          return {
            type: 'hex',
            targetColor: item,
            replaceColor: get(replaceColors, [index])
          }
        }).filter(
          (item) => item.replaceColor !== undefined && item.replaceColor !== ''
        )
      }, undefined
    )
    
    image = await sideEffect(image,options)
    
    console.log('from tintPNG, 执行时间：', Date.now() - start)
    return await image.getBase64Async('image/png')
    
  } catch (e) {
    console.error("form tintPNG, 颜色替换异常，图片名：${name}，异常信息：", e)
    return base64
  }
}
