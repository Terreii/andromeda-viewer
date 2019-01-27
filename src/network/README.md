# Network

This directory contains the clients *UDP network code*.

`circuit.js` and `msgGetters.js` get used in actions and reducers. But everything else is internal.

## Circuit

The core. It keeps a connection to the sim. Other code passes packages to send as JSON objects. And it dispatches incoming packages.

```javascript
// sending a package
circuit.send('PacketAck', {
  Packets: [
    {
      ID: 0
    }
  ]
})
```

### API

#### Constructor

```javascript
new Circuit(ip, port, circuit-code)
```

Argument | Type | Description | Required
---------|------|-------------|---------
`ip` | String | IP of the SIM to connect to. | Yes
`port` | Number | Port of the SIM. | Yes
`circuit-code` | Number | Circuit-code for the connection. Obtained from Login response. | Yes

#### circuit.send(name, data, reliable)

```javascript
circuit.send(name, data[, reliable])
```

Argument | Type | Description | Required
---------|------|-------------|---------
`name` | String | Name of the package to send. | Yes
`data` | Object | Data/Body of the package. | Yes
`reliable` | Boolean | Should that package send reliable. And return a Promise. | No

Returns:
- If reliable is `false-y`, it returns nothing.
- If reliable is `true`, it returns a Promise. That resolves, as soon as an receive-acknowledgement from the SIM returns.

If reliable is set to true, the package will be resend after 500ms, if no receive-acknowledgement is received. It stops after 4 tries. After another 500ms the returned Promise will fail.

Data is a JSON object. The message-content-documentation is in `tools/master_message_template.msg` or [Category:Messages](http://wiki.secondlife.com/wiki/Category:Messages).

```javascript
async function sendStuff () {
  // Send an unreliable package
  circuit.send('PacketAck', {
    Packets: [
      {
        ID: 0
      }
    ]
  })

  // Send a reliable package and wait for it acknowledgement.
  await circuit.send('OpenCircuit', {
    CircuitInfo: [
      {
        IP: '0.0.0.0',
        Port: 13
      }
    ]
  }, true)
}
```

## msgGetters

A collection of helper functions to access values in received messages.

Documentation for the structure of a message is at [Messages-Wiki-Page](http://wiki.secondlife.com/wiki/Messages).

### API

#### getValueOf(msg, block[, block-number], variable)

Argument | Type | Description | Required
---------|------|-------------|---------
`msg` | Object | The parsed message from the SIM. | Yes
`block` | String | Name of the Block to access. | Yes
`block-number` | Number | Index of the block body. Defaults to 0. | No
`variable` | String | Name of the variable in that block. | Yes

Returns the value of that variable. Undefined if it doesn't exist.

```javascript
getValueOf(msg, 'AgentData', 0, 'AgentID')
// or
getValueOf(msg, 'AgentData', 'AgentID')
```

#### getStringValueOf(msg, block[, block-number], variable)

Argument | Type | Description | Required
---------|------|-------------|---------
`msg` | Object | The parsed message from the SIM. | Yes
`block` | String | Name of the Block to access. | Yes
`block-number` | Number | Index of the block body. Defaults to 0. | No
`variable` | String | Name of the variable in that block. | Yes

Returns the value of that variable as a string. If the variable is [`Fixed`, `Variable 1` or `Variable 2`](http://wiki.secondlife.com/wiki/Messages#Data_Types), then they get parsed as __UTF-8__-encoded *c-strings*.

```javascript
function receiveChatFromSimulator (msg) {
  return {
    fromName: getStringValueOf(msg, 'ChatData', 'FromName'), // Parse the senders name
    sourceID: getValueOf(msg, 'ChatData', 'SourceID'),
    ownerID: getValueOf(msg, 'ChatData', 'OwnerID'),
    sourceType: getValueOf(msg, 'ChatData', 'SourceType'),
    chatType: getValueOf(msg, 'ChatData', 'ChatType'),
    audible: getValueOf(msg, 'ChatData', 'Audible'),
    position: getValueOf(msg, 'ChatData', 'Position'),
    message: getStringValueOf(msg, 'ChatData', 'Message'), // Parse the message text
    time: Date.now()
  }
}
```

#### getValuesOf(msg, block[, block-number], varNames)

Argument | Type | Description | Required
---------|------|-------------|---------
`msg` | Object | The parsed message from the SIM. | Yes
`block` | String | Name of the Block to access. | Yes
`block-number` | Number | Index of the block body. Defaults to 0. | No
`varNames` | Array | Array of variable-names in that block. | Yes

Returns a Object with every variable name in that block and the varNames-Array.

```javascript
// for TestMessage -> http://wiki.secondlife.com/wiki/TestMessage
getValuesOf(msg, 'NeighborBlock', 0, ['Test0', 'Test1', 'Test2'])
// or
getValuesOf(msg, 'NeighborBlock', ['Test0', 'Test1', 'Test2'])
```

Example result:
```JSON
{
  "Test0": 0,
  "Test1": 0,
  "Test2": 0
}
```

#### getStringValuesOf(msg, block[, block-number], varNames)

Argument | Type | Description | Required
---------|------|-------------|---------
`msg` | Object | The parsed message from the SIM. | Yes
`block` | String | Name of the Block to access. | Yes
`block-number` | Number | Index of the block body. Defaults to 0. | No
`varNames` | Array | Array of variable-names in that block. | Yes

Returns a Object with every variable name in that block and the varNames-Array. But the values are parsed as Strings.
If the variable is [`Fixed`, `Variable 1` or `Variable 2`](http://wiki.secondlife.com/wiki/Messages#Data_Types), then they get parsed as __UTF-8__-encoded *c-strings*.

```javascript
function receiveChatFromSimulator (msg) {
  return getStringValuesOf(msg, 'ChatData', ['FromName', 'Message', "ChatType"])
}
```

Example result:
```JSON
{
  "FromName": "Tester Resident",
  "Message": "Hello! How are you?",
  "ChatType": "0"
}
```

#### getNumberOfBlockInstancesOf(msg, block)

Argument | Type | Description | Required
---------|------|-------------|---------
`msg` | Object | The parsed message from the SIM. | Yes
`block` | String | Name of the Block to access. | Yes

Returns the number of instances of a block-type.

```javascript
getNumberOfBlockInstancesOf(testMessage, "NeighborBlock") // returns 4
```

#### mapBlockOf(msg, block, fn)

Argument | Type | Description | Required
---------|------|-------------|---------
`msg` | Object | The parsed message from the SIM. | Yes
`block` | String | Name of the Block to access. | Yes
`fn` | Function | Map-Function. With the arguments `(getValueFn, block-index) => {}` | Yes

Returns an Array of the mapped blocks.

The fn gets a getter-function passed.
```javascript
// Getter fn
(varName[, isString]) => {}
```
Argument | Type | Description | Required
---------|------|-------------|---------
`varName` | String | Name of the variable that should be accessed. | Yes
`isString` | Boolean | Should the variable get passed as String? Defaults to 0. | No

The getter function can get called as often as needed.

```javascript
// for AvatarGroupsReply -> http://wiki.secondlife.com/wiki/AvatarGroupsReply
mapBlockOf(msg, "GroupData", (getter, index) => {
  return {
    id: getValue('GroupID'),
    name: getValue('GroupName', true),
    insigniaID: getValue('GroupInsigniaID'),
    title: getValue('GroupTitle', true),
    acceptNotices: getValue('AcceptNotices'),
    powers: getValue('GroupPowers')
  }
})
```

Example Result:
```JSON
[
  {
    "id": "a uuid of the group",
    "name": "Welcome Group",
    "insigniaID": "uuid of the group-insignia",
    "title": "A Welcoming Group",
    "acceptNotices": true,
    "powers": [100, 50]
  }
]
```

## networkMessages

Called from circuit. It will parse an incoming package and return the message, or transform the outgoing JSON data into a package.

A package is a binary buffer.

## Types

Helper functions to read and write a [data-type](http://wiki.secondlife.com/wiki/Messages#Data_Types) from and to a package buffer.
