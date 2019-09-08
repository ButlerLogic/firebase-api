const fs = require('fs')
const path = require('path')
const prefix = path.join(process.cwd(), '../../../')

console.log(`Running in ${prefix}`)

// Setup dependencies
let currentPath = path.join(prefix, 'package.json')
let pkg

if (fs.existsSync(currentPath)) {
  pkg = require(currentPath)
} else {
  throw new Error(`Cannot find ${currentPath} file.`)
}

pkg.scripts = pkg.scripts || {}
pkg.scripts.init = 'api init'

fs.writeFileSync(currentPath, JSON.stringify(pkg, null, 2))
