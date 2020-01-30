const fs = require('fs')
const path = require('path')

class API {
  init () {
    if (process.argv.filter(arg => arg.toLowerCase().indexOf('emulator') >= 0).length > 0) {
      console.log('\n\n<<<<<<<<< Launching in emulator mode >>>>>>>>>\n\n')
      require('localenvironment')

      if (process.env.hasOwnProperty('GOOGLE_APPLICATION_CREDENTIALS')) {
        try {
          let content = require(process.env.GOOGLE_APPLICATION_CREDENTIALS)

          if (content.private_key.trim().indexOf('-----BEGIN PRIVATE KEY-----') !== 0) {
            console.log(`PRIVATE KEY NOT FOUND IN ${process.env.GOOGLE_APPLICATION_CREDENTIALS}.\nFirebase admin connection may be invalid without proper credentials.\n\n`)
            delete process.env.GOOGLE_APPLICATION_CREDENTIALS
          }
        } catch (e) {
          console.log(`PRIVATE KEY NOT FOUND IN ${process.env.GOOGLE_APPLICATION_CREDENTIALS}.\nFirebase admin connection may be invalid without proper credentials.\n\n`)
          delete process.env.GOOGLE_APPLICATION_CREDENTIALS
        }
      }
    }

    // Make the admin available to all endpoints
    global.functions = require('firebase-functions')
    global.admin = require('firebase-admin')
    admin.initializeApp()
  }

  get exports() {
    let exportable = {}

    fs.readdirSync(process.cwd()).forEach(location => {
      if (!location.startsWith('.') && !location.startsWith('_')) {
        location = path.resolve(location)

        if (fs.statSync(location).isDirectory() && path.dirname(location).toLowerCase() !== 'node_modules') {
          fs.readdirSync(location).forEach(filepath => {
            filepath = path.join(location, filepath)

            if (fs.statSync(filepath).isFile() && path.extname(filepath).toLowerCase() === '.js') {
              Object.assign(exportable, require(filepath))
            }
          })
        }
      }
    })

    return exportable
  }
}

module.exports = new API()