const fs = require('fs')
const path = require('path')

class API {
  static init () {
    if (process.argv.filter(arg => arg.toLowerCase().indexOf('emulator') >= 0).length > 0) {
      console.log('\n\n<<<<<<<<< Launching in emulator mode >>>>>>>>>\n\n')
      require('localenvironment')
    }

    // Make the admin available to all endpoints
    global.functions = require('firebase-functions')
    global.admin = require('firebase-admin')
    admin.initializeApp()
  }

  static setup () {
    fs.readdirSync(process.cwd()).forEach(location => {
      if (!location.startsWith('.') && !location.startsWith('_')) {
        location = path.resolve(location)

        if (fs.statSync(location).isDirectory() && path.dirname(location).toLowerCase() !== 'node_modules') {
          fs.readdirSync(location).forEach(filepath => {
            filepath = path.join(location, filepath)

            if (fs.statSync(filepath).isFile() && path.extname(filepath).toLowerCase() === '.js') {
              Object.assign(exports, require(filepath))
            }
          })
        }
      }
    })
  }

  get API () {
    return require('@ecor/common-api')
  }
}

module.exports = new API()