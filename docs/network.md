# Network

## UDP packets
The [SL-Protocol](http://wiki.secondlife.com/wiki/Protocol) uses UDP for communication.

A browser doesn't allow a UDP-connection. So instead the viewer uses a WebSocket to send the packets to the server, with will send it to the SL-SIM. And backwards, too.

To communication is done thru the **circuit.js**. With **networkNessages** the packets are then translated to a JSON-Object.

For a list of all messages of the SL-protocol look in the [tools/master_message_template.msg](http://secondlife.com/app/message_template/master_message_template.msg).

For an exact description of every message, look in the SL-wiki under [all messages](http://wiki.secondlife.com/wiki/Category:Messages) or go directly to **wiki.secondlife.com/wiki/[_put message name here_]**.

## JSON Layout for incoming messages
After every packet is processed to will have following layout:

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

## JSON Layout for outgoing messages

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

## Wiki
* [Message Layout](http://wiki.secondlife.com/wiki/Message_Layout)
* [Packet Layout](http://wiki.secondlife.com/wiki/Packet_Layout)
* [Circuits](http://wiki.secondlife.com/wiki/Circuits)
* [Packet Accounting](http://wiki.secondlife.com/wiki/Packet_Accounting)
