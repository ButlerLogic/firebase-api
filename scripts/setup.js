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

// Look for the service account file
let serviceKeyPath = null
fs.readdirSync(process.cwd()).forEach(filepath => {
  if (fs.extname(filepath).toLowerCase() === '.json') {
    let filename = path.basename(filepath, '.json')
    if (['package', 'firebase'].indexOf(filename) < 0) {
      serviceKeyPath = path.resolve(filepath)
    }
  }
})

if (serviceKeyPath === null) {
  let fp = path.join(process.cwd(), '.firebase_credentials.json')
  fs.writeFileSync(fp, JSON.stringify({
    "type": "service_account",
    "project_id": "fill_me_in",
    "private_key_id": "fill_me_in",
    "private_key": "fill_me_in",
    "client_email": "fill_me_in",
    "client_id": "fill_me_in",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "fill_me_in"
  }, null, 2))

  serviceKeyPath = fp
}

// Make sure the env.json file exists for local dev
currentPath = path.join(process.cwd(), 'env.json')

let env = {}

if (fs.existsSync(currentPath)) {
  env = require(currentPath)
}

env.GOOGLE_APPLICATION_CREDENTIALS = serviceKeyPath
fs.writeFileSync(currentPath, JSON.stringify(env, null, 2))

// Setup the base file
currentPath = path.join(process.cwd(), 'index.js')

if (!fs.existsSync(currentPath)) {
  let content = `const FirebaseAPI = require('@butlerlogic/firebase-api')

// Create the following global references:
// - functions: Reference to the firebase-functions module
// - admin: Reference to a preauthorized firebase admin SDK instance.
// Remember to examine the env.json file to assure the appropriate
// service key file is used.
FirebaseAPI.init()
FirebaseAPI.setup()
`.trim()

  fs.writeFileSync(currentPath, content)

  // Setup an example routing system
  let apiPath = path.join(path.dirname(currentPath), 'api')
  if (!fs.existsSync(apiPath)) {
    fs.mkdirSync(apiPath)
  }

  if (!fs.existsSync(path.join(apiPath, 'routes.js'))) {
    fs.writeFileSync(path.join(apiPath, 'routes.js'), `const functions = require('firebase-functions')
const express = require('express')
const API = require('@butlerlogic/firebase-api').API // Reference to @ecor/common-api module.
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