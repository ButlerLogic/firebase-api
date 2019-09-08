# firebase-api

A boilerplate structure for building an HTTP API using Firebase functions.

## Usage

**tldr;** _(but you really should read below - this does ALOT)_
```sh
npm i @butlerlogic/firebase-api -S
npm run init
```

**Installation Instructions**

Navigate to the functions directory in your Firebase project and run `npm i @butlerlogic/firebase-api -S`. This will install the module and add it to the `package.json` file. It will also create a new npm script in the `package.json` file, called `init`.

Next, you can initialize the project with a new boilerplate API. Make sure you understand what will be produced (detailed below). Once you're comfortable, run `npm run init`.

The `init` command performs the following actions:

**1. Creates a new `index.js` file**
  The index file is very simple, with very little code. However; it is inceredibly powerful. The code in the file will scan the directory it is in (including any top level directories within the root) looking for files that do not begin with a `_` or `.`. It attempts to load/export each of these files as a firebase function.
  
  This approach allows developers to organize code into directories however desired.

**1. Creates `api/routess.js` file**
  This file contains an express configuration, including an example endpoint that will run.
  
  You'll also notice a [Common API](https://www.npmjs.com/package/@ecor/common-api) module is preconfigured and applied. This provides rudimentary API endpoints, such as `/ping`, `/version`, and `/info`. It also applies an open CORS policy to make development easy, which you'll most likely want to modify before moving to production if you want strict CORS enforcement (fine to leave as is for most API's).
  
  The common API provides a number of rapid prototyping methods that can be used in development and production. It's strongly advised you read about what is possible (mostly because it's really easy).

**1. Creates `.firebase_credentials.json` _if no credential file can be found_.**
  Running some Firebase functions locally does not require the use of credentials, but you'll need them if you want to connect to the production FireStore database or other features while you're working locally. This file should only be loaded when running the emulator _locally_ and it should **never be commited to git or any part of Firebase**. This module will automatically load the credentials file for you when running the emulator and skip it in when deployed (because the hosted version automatically loads your credentials). This file is referenced in the `env.json` file (see below). If you have a different credential file, make sure to modify the `env.json` file to reflect the appropriate path.

**1. Creates `env.json` file**
  This module leverages [localenvironment](https://github.com/coreybutler/localenvironment) to simplify environment management. By default, this will load an environment variable this module understands/respects when running Firebase functions in the local emulator.

**1. Creates npm commands:**
  Several commands are created automatically, using the [@butlerlogic/firebase](https://github.com/butlerlogic/firebase) CLI utility:
  
  - `npm run setup`: Parses the API code for all references to `functions.config()` and reverse engineers an appropriate `.runtimeconfig.json` from the code. You will need to fill in the appropriate values. This append `.runtimeconfig.json` if it already exists. This is most useful when trying to find out which environment variables are used within the code base, or when starting work on an existing project.
  - `npm run configure`: This will configure the environment variables on the Firebase server using the values found in the `.runtimeconfig.json` file.
  - `npm run configure:debug`: Same as above, but it will print the configuration command to the screen in plaintext. THIS MAY EXPOSE SENSISTIVE CONTENT, so don't use this on a CI server or other remote environment. Only use it when working on your local workstation.
  - `npm run deploy`: This runs the configure function, then the firebase deploy command (functions only).