# Network

The [SL/openSIM-Protocol](http://wiki.secondlife.com/wiki/Protocol) uses both UDP and HTTP(S).
The server acts as a proxy of all protocols parts.

## UDP packets
The SL-Protocol uses UDP for its real-time communication.

Because browser don't have a UDP-API for sites, packets are send through the server using a WebSocket. The server will act as a proxy between client and SL/openSim server.

The Circuit class in **circuit.js** handles the UDP-communication. It uses **networkMessages.js** to read and write packets.

A list of all messages of the SL-protocol exist in [tools/master_message_template.msg](http://secondlife.com/app/message_template/master_message_template.msg).

For an exact description of every message, look in the SL-wiki under [all messages](http://wiki.secondlife.com/wiki/Category:Messages). Or open **wiki.secondlife.com/wiki/[_put message name here_]**.

### JSON Layout for incoming messages
Every incoming packet will have following layout:

```javascript
{
  name: String,
  frequency: 'High' || 'Medium' || 'Low' || 'Fixed',
  number: Number,
  trusted: Boolean,
  isOld: undefined || String,
  size: Number,
  blocks: [ // List of all blocks
    [] block instances
  ],
  "block-name": [ // times the quantity of the block
    {
      nameOfTheVariable: valueOfTheVariable
    }
  ]
};
```

* `name` is the message type name as it is in the template and on the wiki.
* `frequency` send frequency. Also a part of the identifier.
* `number` identifier in the frequency
* `trusted` is it from LL?
* `isOld` Will contain a string if it is obsolete. And `undefined` if it is not obsolete.
* `size` size in bytes
* `blocks` Array of all blocks
* All blocks are accessible through their names.

### JSON Layout for outgoing messages

```javascript
{
  nameOfTheBlock: [   // times the quantity needed
    {
      variableName: value
    }
  ]
}
 ```
* `nameOfTheBlock` the name as it is in the wiki and template file. Every object will be a block-instance. Single will have one. Missing block-instances will result to 0s.
  * `variableName` the name of the variable as it is in the wiki and template file. It value should be in the range and the type of the variable.

To identify which message it is, the first argument of the send-method of a circuit is the name of the message as a String.

```javascript
circuit.send('TestMessage', {
  TestBlock1: [
    {
      Test1: 1
    }
  ],
  NeighborBlock: [
    {
      Test0: 2,
      Test1: 3,
      Test2: 4
    },
    {
      Test0: 2,
      Test1: 3,
      Test2: 4
    },
    {
      Test0: 2,
      Test1: 3,
      Test2: 4
    },
    {
      Test0: 2,
      Test1: 3,
      Test2: 4
    }
  ]
}, [reliable])
```

### Wiki
* [Message Layout](http://wiki.secondlife.com/wiki/Message_Layout)
* [Packet Layout](http://wiki.secondlife.com/wiki/Packet_Layout)
* [Circuits](http://wiki.secondlife.com/wiki/Circuits)
* [Packet Accounting](http://wiki.secondlife.com/wiki/Packet_Accounting)

## LLSD

More and more UDP packages get obsoleted in favour of HTTP(S) based messages. They get encoded using LindenLabs [LLSD](http://wiki.secondlife.com/wiki/LLSD) format. `src/llsd.js` is a complete Javascript implementation from LindenLab. It supports all encodings: XML, Binary and JSON. The XML encoding is the default one.

The http endpoints get revered as capabilities. Their URL change for every session and sometimes also when changing the SIM. The login result will contain the `SeedCapabilities`. it will result a list of all capability-urls.

A LLSD-List with all capabilities-names gets pushed to the SeedCapabilities.
The names are in **src/actions/capabilities.json**.
The server returns then a LLSD-Dictionary ({ cap-name: URL }).

### EventQueueGet

The capability [`EventQueueGet`](http://wiki.secondlife.com/wiki/EventQueueGet) is one of the two ways the sim-server can push events to the client/viewer. The technique used here is __HTTP Long Polling__. The other being UDP.

You can find more in its [documentation](http://wiki.secondlife.com/wiki/EventQueueGet).
