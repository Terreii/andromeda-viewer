/* eslint-env node */
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const fetch = require('node-fetch');

const writeFile = util.promisify(fs.writeFile);

const repositoryURL = 'https://bitbucket.org/lindenlab/viewer-release/raw/tip/';

fetch(repositoryURL + 'indra/newview/llviewerregion.cpp')
  .then((response) => {
    if (response.status === 200) {
      return response.text();
    }
    throw new Error(`${response.status} - ${response.statusText}`);
  })

  .then(
    (file) =>
      file
        .split('\n')
        .filter((line) => line.includes('capabilityNames.append'))
        .map((line) => line.split('"')[1]) // capabilityNames.append("EventQueueGet"); -> EventQueueGet
  )

  .then((caps) => {
    const capsJSON = JSON.stringify(caps, null, 2);
    const outPath = path.resolve('src', 'actions', 'capabilities.json');
    return writeFile(outPath, capsJSON + '\n');
  })

  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

fetch(repositoryURL + 'scripts/messages/message_template.msg')
  .then((response) => {
    if (response.status < 300) {
      return response.text();
    }
    throw new Error(`${response.status} - ${response.statusText}`);
  })

  .then((file) =>
    writeFile(path.resolve('tools', 'message_template.msg'), file)
  )

  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
