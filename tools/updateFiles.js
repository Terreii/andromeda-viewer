'use strict'

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

const repositoryURL = 'https://bitbucket.org/lindenlab/viewer/raw/master/'

async function get (url) {
  const response = await fetch(url)

  if (response.ok) {
    return response.text()
  }
  throw new Error(`${response.status} - ${response.statusText}`)
}

get(repositoryURL + 'indra/newview/llviewerregion.cpp')

  .then(file => file
    .split('\n')
    .filter(line => line.includes('capabilityNames.append'))
    .map(line => line.split('"')[1]) // capabilityNames.append("EventQueueGet"); -> EventQueueGet
  )

  .then(caps => {
    const capsJSON = JSON.stringify(caps, null, 2)
    const outPath = path.resolve('src', 'actions', 'capabilities.json')
    return fs.promises.writeFile(outPath, capsJSON + '\n')
  })

  .catch(error => {
    console.error(error)
    process.exit(1)
  })

get(repositoryURL + 'scripts/messages/message_template.msg')

  .then(file => fs.promises.writeFile(
    path.resolve('tools', 'message_template.msg'),
    file
  ))

  .catch(error => {
    console.error(error)
    process.exit(1)
  })
