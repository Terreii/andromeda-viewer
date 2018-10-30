# Network

The [SL/openSIM-Protocol](http://wiki.secondlife.com/wiki/Protocol) uses both UDP and HTTP(S).
The server acts as a proxy of all protocols parts.

## UDP packets
The SL-Protocol uses UDP for its realtime communication.

Because browser don't have a UDP-API for sites, a WebSocket is used for sending the packets. It will send them to the Andromeda server, which will send it to the SL- or openSIM sim, and backwards, too.

Communication is done thru the Circuit class in **circuit.js**. In **networkNessages** the packets are then translated between a JSON representation for the client and a TypedArray for the SIM.

A list of all messages of the SL-protocol can be found in [tools/master_message_template.msg](http://secondlife.com/app/message_template/master_message_template.msg).

For an exact description of every message, look in the SL-wiki under [all messages](http://wiki.secondlife.com/wiki/Category:Messages) or directly go to **wiki.secondlife.com/wiki/[_put message name here_]**.

### JSON Layout for incoming messages
After every packet is processed, it will have following layout:

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
* `frequency` is how often it will be sent. Also a part of the identifier.
* `number` identifier in the frequency
* `trusted` is it from LL?
* `isOld` normally it will be undefined. This should never be a String. Or else it is obsolete
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
* `nameOfTheBlock` the name as it is in the wiki and template file. Containing as many objects as needed. Single will have one.
  * `variableName` the name of the variable as it is in the wiki and template file. It value should be in the range and the type of the varibale.

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

More and more is done over HTTP(S). And mostly encoded in LindenLabs [LLSD](http://wiki.secondlife.com/wiki/LLSD) format. `src/llsd.js` is a complete Javascript implementation from LindenLab. It supports all concodings: XML, Binary and JSON. The XML encoding is the default one.

The http endpoints are called capabilities and change for every session and sometimes also when changing the SIM. The URL of them can be fetched at the `SeedCapabilities` endpoint, which will be returned on login or on the sim change.

A LLSD-List with all capabilities-names is PUSHed to the SeedCapabilities and return as a LLSD-Dictionary ({cap-name: URL}).

### EventQueueGet

[`EventQueueGet`](http://wiki.secondlife.com/wiki/EventQueueGet) is a special capability: it, together with the UDP-circuit, are the only way the sim-server can push events to the client/viewer. This is done using the __HTTP Long Polling__ technique.

More can be found in its [documentation](http://wiki.secondlife.com/wiki/EventQueueGet).
