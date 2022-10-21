const path = require("path");

module.exports = {
    mode: 'production',
    entry: {
        'svg': './tintSVG.js'
    },
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].worker.js'
    }
}
