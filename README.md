# Andromeda-Viewer
Small web-client for connecting to the virtual world of [Second Life](https://secondlife.com)™ and [OpenSimulator](http://opensimulator.org/wiki/Main_Page).

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Dependency Status](https://david-dm.org/Terreii/andromeda-viewer.svg)](https://david-dm.org/Terreii/andromeda-viewer)
[![devDependency Status](https://david-dm.org/Terreii/andromeda-viewer/dev-status.svg)](https://david-dm.org/Terreii/andromeda-viewer#info=devDependencies)
[![Build Status](https://travis-ci.org/Terreii/andromeda-viewer.svg?branch=master)](https://travis-ci.org/Terreii/andromeda-viewer)
[![Known Vulnerabilities](https://snyk.io/test/github/Terreii/andromeda-viewer/badge.svg)](https://snyk.io/test/github/Terreii/andromeda-viewer)

_**This viewer is not production ready!**_

## Contributing
Feel free to contribute in any way you like. You can't program? You are still needed!

Please read and review the documentation. You can find it in the **doc-folder**.

#### Having questions?
Contact me at any time.

### How to get started
You need to have **[node.js](https://nodejs.org/) version 12.16.0 or higher** installed and a *Second Life* account or an *account on an [OpenSimulator Grid](http://opensimulator.org/wiki/Grid_List)*. [More on node.js and npm.js](https://docs.npmjs.com/getting-started/what-is-npm) (npm.js comes with node.js). You can check your installed version with the command `node -v`.

To start open a terminal window (cmd or PowerShell on windows) in your working copy of this project. And run the command `npm install`. This will install all dependencies.

After that run `npm run build` to build the client side and make the viewer useable.

Then run `npm start` to start the server. Now you can use the viewer under http://127.0.0.1:8000/.

```sh
git clone https://github.com/Terreii/andromeda-viewer.git
cd andromeda-viewer
npm install
npm run build
npm start
```

If you want to start developing you should run `npm run dev` instead. It will build the viewer every time you make a change, start the server and also starts pouchdb-server.

```sh
npm run dev
```

For more information how to use npm, please read the [npm-documentation](https://docs.npmjs.com/).

To make the setup-process easier, everything needed for this project should be a npm dependency.

### npm scripts for this project

command | what it does
--------|-------------
`npm run build` | Builds the viewer for production. The viewer is in an unusable state after cloning.
`npm run dev` | Builds the viewer. It continues to run and build the viewer when a file changes. This is the recommended build command while developing!
`npm run start-server-dev` | Runs the server in development. Intended to be run with `npm run dev-server`.
`npm run dev-server` | Like `npm run dev` but configured to proxy to the server which runs on `npm start` or `npm run start-server-dev`. Intended to be used for developing the **server** _together_ with the **client**.
`npm test` | Runs all tests. Please run this before committing!
`npm run test-coverage` | Runs all test and outputs a test coverage report. And will open the report.
`npm run test:docs` | Runs [textlint](https://textlint.github.io/) and [alex.js](https://alexjs.com/) for catching misspelled, insensitive, inconsiderate writing in the documentation.
`npm run type-docs` | Builds and opens the type documentation.
`npm run open-type-docs` | Opens the existing type documentation.
`npm run update-files` | Updates all [capabilities names](http://wiki.secondlife.com/wiki/Category:Capabilities) and [UDP-Messages](http://wiki.secondlife.com/wiki/Category:Messages).
`npm run update-coc` | Updates the CODE_OF_CONDUCT.md
`npm run update-contrib` | Updates the CONTRIBUTING.md
`npm run fix:docs` | Runs `textlint --fix`.
`npm run fix:style` | Runs `standard --fix`. It can fix many standard style rules.
`npm run fix` | Runs npm run `npm run fix:docs` and `npm run fix:style`.
`npm start` | Starts the server. The viewer can then be used on the local computer. This is for production. `npm run build` must be run first.

Enter those commands in a terminal (cmd or PowerShell on Windows) and press enter to run them.

### Getting SL Protocol documentation
The [SL-Wiki](http://wiki.secondlife.com/wiki/Protocol) has most documentation for the SL-protocol.

### Known Issues

[If testing fails to start on MacOS](https://github.com/Terreii/andromeda-viewer/blob/latest/README-create-react-app.md).

## Disclaimer
[Second Life(TM)](https://secondlife.com) is a product by [Linden Lab](http://www.lindenlab.com/). Linden Lab is not involved with this project!

This is a third-party viewer! _Use it on your own risk!_
