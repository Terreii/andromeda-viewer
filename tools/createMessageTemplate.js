'use strict';

var fs = require('fs');

// parse the message_template.msg and creates the templates for the messages
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

fs.readFile(process.cwd() + '/tools/master_message_template.msg',
  {encoding: 'utf8'},
  parseMessageTemplate);

function parseMessageTemplate (err, data) {
  if (err) {
    console.error(err);
    return;
  }
  var allMessages = data.split('\n').map(function (line) {
    // remove the commens
    return line.replace(/\/\/.*$/, '').replace(/^\s+$/g, '');
  }).filter(function (line) {
    return line.length !== 0 && line !== 'version 2.0';
  }).reduce(function (combined, line) { // combine the blocks together
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
  }, {
    finished: [],
    thisMessage: null
  }).finished.map(function (message) {
    // parse a message
    var head = message[0].trim().split(/\s+/g);
    var body = message.slice(1).reduce(function (blocks, line) {
      var trimed = line.trim();
      if (trimed.length === 1 && trimed.charAt(0) === '{') {
        blocks.thisBlock = {
          name: '',
          quantity: '',
          times: 0,
          variables: []
        };
      } else if (trimed.length === 1 && trimed.charAt(0) === '}') {
        blocks.all.push(blocks.thisBlock);
      } else if (trimed.charAt(0) !== '{') {
        // block info has no { at the beginning
        var info = trimed.split(/\s+/g);
        blocks.thisBlock.name = info[0];
        blocks.thisBlock.quantity = info[1];
        blocks.thisBlock.times = +info[2];
      } else if (trimed.charAt(0) === '{' && trimed.length > 2) {
        // all variables have the fromat { name type quantity? }
        var variable = trimed.split(/\s+/g);
        var type = variable[2];
        if (type === 'Variable') {
          type += variable[3].trim();
        }
        blocks.thisBlock.variables.push({
          name: variable[1],
          type: type,
          times: +variable[3]
        });
      }
      return blocks;
    }, {
      all: [],
      thisBlock: null
    }).all;
    return {
      name: head[0],
      frequency: head[1],
      number: +head[2],
      trusted: head[3] === 'Trusted',
      zerocoded: head[4] === 'Zerocoded',
      isOld: head[5],
      body: body
    };
  });

  var dataJson = JSON.stringify(allMessages);

  fs.writeFileSync(process.cwd() + '/jsBuilds/messageTemplate.json', dataJson,
    'utf8');
}