const path = require('path')
const IconfontBuilder = require('simple-iconfont-builder')

IconfontBuilder.build(
  path.resolve(__dirname, '../../src/assets/styles/iconfont.css')
)
