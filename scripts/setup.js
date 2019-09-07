const fs = require('fs')
const path = require('path')

// Setup dependencies
let currentPath = path.join(process.cwd(), 'package.json')
let pkg

if (fs.existsSync(currentPath)) {
  pkg = require(currentPath))
} else {
  pkg = {
    name: path.basename(process.cwd()),
    version: '1.0.0-alpha.1',
    private: true,
    description: "Cloud Functions for Firebase",
    engines: {
      node: '8'
    }
  }
}

pkg.scripts = pkg.scripts || {}
pkg.scripts = Object.assign(pkg.scripts, {
  serve: 'firebase serve --only functions,database',
  shell: 'firebase functions:shell',
  start: 'firebase emulators:start --only functions',
  logs: 'firebase functions:log',
  deply: 'fb deploy',
  configure: 'fb configure',
  setup: 'fb setup'
})

let modPkg = require('./package.json')
pkg.devDependencies = pkg.devDependencies || {})
pkg.devDependencies[modPkg.name] = `^${modPkg.version}`
pkg.dependencies['localenvironment'] = `^${modPkg.dependencies.localenvironment}`.replace(/\^+/gi, '^')

fs.writeFileSync(currentPath, JSON.stringify(pkg, null, 2))

// Setup the base file
currentPath = path.join(process.cwd(), 'index.js')

if (!fs.existsSync(currentPath)) {
  let content = `const functions = require('firebase-functions')
const fs = require('fs')
const path = require('path')

if (process.argv.filter(arg => arg.toLowerCase().indexOf('emulator') >= 0).length > 0) {
  console.log('\n\n<<<<<<<<< Launching in emulator mode >>>>>>>>>\n\n')
  require('localenvironment')
}

// Make the admin available to all endpoints
global.admin = require('firebase-admin')
admin.initializeApp()

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
})`.trim()

  fs.writeFileSync(currentPath, content)

  // Setup an example routing system
  let apiPath = path.join(path.dirname(currentPath), 'api')
  if (!fs.existsSync(apiPath)) {
    fs.mkdirSync(apiPath)
  }

  if (!fs.existsSync(path.join(apiPath, 'routes.js'))) {
    fs.writeFileSync(path.join(apiPath, 'routes.js'), `const functions = require('firebase-functions')
const express = require('express')
const API = require('@ecor/common-api')
const app = express()

API.applySimpleCORS(app)
API.applyCommonConfiguration(app)

app.get('/hello', API.reply({
  msg: 'hi!',
  action: 'Check out the /info endpoint. It has useful details about this API.'
}))

const api = functions.https.onRequest(app)

module.exports = { api }
`.trim() + '\n')
  }
} else {
  console.log(`Did not generate ${currentPath} because it already exists. Example routes were also not created for this reason.`)
}