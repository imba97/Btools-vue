const { zip } = require('zip-a-folder')
const path = require('path')

;(async function () {
  console.log('开始压缩')
  const zipPath = path.resolve(__dirname, `../../${process.argv[2]}.zip`)
  await zip('./Build', zipPath)
  console.log(`压缩成功 ${zipPath}`)
})()
