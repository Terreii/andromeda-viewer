'use strict';

const fs = require('fs');
const path = require('path');

// parse the message_template.msg and creates the templates for the messages
// It is implemented as a loader for Webpack
// http://secondlife.com/app/message_template/master_message_template.msg
// results in:
// [
//   {
//     name: String,
//     frequency: 'High'|'Medium'|'Low'|'Fixed',
//     number: Number,
//     trusted: Boolean,
//     zerocoded: Boolean,
//     isOld: undefined|String,
//     body: [
//       {
//         name: String,
//         quantity: 'Single'|'Multiple'|'Variable',
//         times: Number, // only if quantity is Multiple
//         variables: [
//           {
//             name: String,
//             type: types,
//             times: Number|NaN // by "Fixed"
//           }
//         ]
//       }
//     ]
//   }
// ]

const templatePath = path.resolve('tools', 'message_template.msg');
const messageTemplateData = fs.readFileSync(templatePath, 'utf8');

const parsedTemplateString = parseMessageTemplate(messageTemplateData);
const outPath = path.resolve('src', 'network', 'messages.json');
fs.writeFileSync(outPath, parsedTemplateString, 'utf8');

function parseMessageTemplate(data) {
  const allMessages = data
    .split('\n')
    .map((line) => {
      // remove the commens
      return line.replace(/\/\/.*$/, '').replace(/^\s+$/g, '');
    })
    .filter((line) => {
      return line.length !== 0 && line !== 'version 2.0';
    })
    .reduce(combineBlocks, {
      finished: [], // All finished messages will be stored here
      thisMessage: null, // The message that is currently parsed is stored here
    })
    .finished.map(parseMessage);

  return JSON.stringify(allMessages);
}

function combineBlocks(combined, line) {
  // combine the blocks together
  switch (line.charAt(0)) {
    case '{': // start a new block
      combined.thisMessage = [];
      break;
    case '}': // the block is done
      combined.finished.push(combined.thisMessage);
      break;
    default:
      combined.thisMessage.push(line);
      break;
  }
  return combined;
}

function parseMessage(message) {
  // parse a message
  const head = message[0].trim().split(/\s+/g);
  const body = message.slice(1).reduce(parseBlocks, {
    all: [],
    thisBlock: null,
  }).all;
  return {
    name: head[0],
    frequency: head[1],
    number: +head[2],
    trusted: head[3] === 'Trusted',
    zerocoded: head[4] === 'Zerocoded',
    isOld: head[5],
    body: body,
  };
}

function parseBlocks(blocks, line) {
  const trimed = line.trim();
  if (trimed.length === 1 && trimed.charAt(0) === '{') {
    blocks.thisBlock = {
      name: '',
      quantity: '',
      times: 0,
      variables: [],
    };
  } else if (trimed.length === 1 && trimed.charAt(0) === '}') {
    blocks.all.push(blocks.thisBlock);
  } else if (trimed.charAt(0) !== '{') {
    // block info has no { at the beginning
    const info = trimed.split(/\s+/g);
    blocks.thisBlock.name = info[0];
    blocks.thisBlock.quantity = info[1];
    blocks.thisBlock.times = +info[2];
  } else if (trimed.charAt(0) === '{' && trimed.length > 2) {
    // all variables have the fromat { name type quantity? }
    const variable = trimed.split(/\s+/g);
    let type = variable[2];
    if (type === 'Variable') {
      type += variable[3].trim();
    }
    blocks.thisBlock.variables.push({
      name: variable[1],
      type: type,
      times: +variable[3],
    });
  }
  return blocks;
}
