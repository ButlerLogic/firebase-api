#!/usr/bin/env node

let args = process.argv.slice(2)
let cmd = args.shift()

const fs = require('fs')
const path = require('path')
const prefix = process.cwd() //, '../../../')

switch (cmd.trim().toLowerCase()) {
  case 'init':
    // Setup dependencies
    let currentPath = path.join(prefix, 'package.json')
    let pkg

    if (fs.existsSync(currentPath)) {
      pkg = require(currentPath)
    } else {
      pkg = {
        name: path.basename(prefix),
        version: '1.0.0-alpha.1',
        private: true,
        description: "Cloud Functions for Firebase",
        engines: {
          node: '10'
        }
      }
    }

    pkg.scripts = pkg.scripts || {}
    pkg.scripts = Object.assign(pkg.scripts, {
      serve: 'firebase serve --only functions',
      shell: 'firebase functions:shell',
      start: 'firebase emulators:start --only functions',
      logs: 'firebase functions:log',
      deploy: 'fb deploy',
      configure: 'fb configure',
      'configure:debug': 'fb configure --debug',
      setup: 'fb setup'
    })

    let modPkg = require(path.join(__dirname, 'package.json'))
    pkg.devDependencies = pkg.devDependencies || {}
    pkg.devDependencies[modPkg.name] = `^${modPkg.version}`
    pkg.dependencies['@butlerlogic/firebase'] = `^${modPkg.dependencies['@butlerlogic/firebase']}`.replace(/\^+/gi, '^')
    delete pkg.devDependencies['@butlerlogic/firebase']
    delete pkg.devDependencies['@butlerlogic/firebase-api']
    pkg.dependencies['localenvironment'] = `^${modPkg.dependencies.localenvironment}`.replace(/\^+/gi, '^')
    pkg.dependencies['firebase-admin'] = `^${modPkg.dependencies['firebase-admin']}`.replace(/\^+/gi, '^')
    pkg.dependencies['firebase-functions'] = `^${modPkg.dependencies['firebase-functions']}`.replace(/\^+/gi, '^')

    fs.writeFileSync(currentPath, JSON.stringify(pkg, null, 2))

    // Look for the service account file
    let serviceKeyPath = null
    fs.readdirSync(prefix).forEach(filepath => {
      if (path.extname(filepath).toLowerCase() === '.json') {
        let filename = path.basename(filepath, '.json')
        if (['package', 'package-lock', 'firebase', '.runtimeconfig', 'env'].indexOf(filename) < 0 && filename.indexOf('fire') !== 0) {
          serviceKeyPath = filepath
        }
      }
    })

    if (serviceKeyPath === null) {
      let fp = path.join(prefix, '.firebase_credentials.json')
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
    currentPath = path.join(prefix, 'env.json')

    let env = {}

    if (fs.existsSync(currentPath)) {
      env = require(currentPath)
    }

    env.GOOGLE_APPLICATION_CREDENTIALS = serviceKeyPath
    fs.writeFileSync(currentPath, JSON.stringify(env, null, 2))

    // Setup the base file
    currentPath = path.join(prefix, 'index.js')

    if (!fs.existsSync(currentPath)) {
      let content = `const FirebaseAPI = require('@butlerlogic/firebase-api')

// Create the following global references:
// - functions: Reference to the firebase-functions module
// - admin: Reference to a preauthorized firebase admin SDK instance.
// Remember to examine the env.json file to assure the appropriate
// service key file is used.

// Initialize the API with the appropriate credentials.
FirebaseAPI.init()

// Assign the FirebaseAPI exports to the main exports
Object.assign(exports, FirebaseAPI.exports)
`.trim()

      fs.writeFileSync(currentPath, content)

      // Setup an example routing system
      let apiPath = path.join(path.dirname(currentPath), 'api')
      if (!fs.existsSync(apiPath)) {
        fs.mkdirSync(apiPath)
      }

      if (!fs.existsSync(path.join(apiPath, 'routes.js'))) {
        fs.writeFileSync(path.join(apiPath, 'routes.js'), `const express = require('express')
const API = require('@butlerlogic/common-api')
const app = express()

API.applySimpleCORS(app)
API.applyCommonConfiguration(app)

app.get('/hello', API.reply({
  msg: 'hi!',
  action: 'Check out the /info endpoint. It has useful details about this API.'
}))

// functions is made available globally in the index.js file (init method)
const api = functions.https.onRequest(app)

module.exports = { api }
`.trim() + '\n')
      }
    } else {
      console.log(`Did not generate ${currentPath} because it already exists. Example routes were also not created for this reason.`)
    }

    return

  default:
    console.log('Usage: api <cmd>\n\n')
    console.log('Commands:\n')
    console.log('\tinit:\tInitialize an API shell.')
}