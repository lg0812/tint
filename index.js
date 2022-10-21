const {tintPNG} = require("./tintPNG")
const {tintSVG} = require("./tintSVG")
const {map} = require('lodash')
const  {parentPort, workerData} = require("worker_threads")

const {type, data}  = workerData
if(type === 'svg') {
  map(data, item => {
    tintSVG(item).then(base64=> {
      parentPort.postMessage({
        namePath: item.namePath,
        base64
      })
    })
  })
} else {
  map(data, item => {
    tintPNG(item).then(base64 => {
      parentPort.postMessage({
        namePath: item.namePath,
        base64
      })
    })
  })
}
