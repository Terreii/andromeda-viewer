# Network

## UDP packets
The [SL-Protocol](http://wiki.secondlife.com/wiki/Protocol) uses UDP for communication.

A browser doesn't allow a UDP-connection. So instead the viewer uses a WebSocket to send the packets to the server, with will send it to the SL-SIM. And backwards, too.

To communication is done thru the **circuit.js**. With **networkNessages** the packets are then translated to a JSON-Object.

For a list of all messages of the SL-protocol look in the [tools/master_message_template.msg](http://secondlife.com/app/message_template/master_message_template.msg).

For an exact description of every message, look in the SL-wiki under [all messages](http://wiki.secondlife.com/wiki/Category:Messages) or go directly to **wiki.secondlife.com/wiki/[_put message name here_]**.

## JSON Layout
After every packet is processed to will have following layout:

```javascript
{
  name: String,
  frequency: 'High' || 'Medium' || 'Low' || 'Fixed',
  number: Number,
  trusted: Boolean,
  zerocoded: Boolean,
  isOld: undefined || String,
  size: Number,
  buffer: Buffer, // only the message body part
  body: [
    { // block
      name: String,
      data: [ // times the quantity of the block
        {
          nameOfTheVariable: { // MessageDataType
            name: String,
            value: valueOfTheVariable
          },
          all: [] // all variables
       }
     ]
   }
 ]
};
```

* `name` is the message type name as it is in the template and on the wiki.
* `frequency` is how often it will be sent. Also a part of the identifier.
* `number` identifier in the frequency
* `trusted` is it from LL?
* `zerocoded` was the body zeroencoded
* `isOld` normally it will be undefined. This should never be a String. Or else it is obsolete
* `size` size in bytes
* `buffer` part of the message that was the body
* `body` Array of all blocks
  * `block` A block as in the message template
  * `name` String name of the block
  * `data` Array containing the same number of Objects that the message have. If it is a Single block it will have 1 object. Else it will have more.

In every data-Object there is for every variable an Object with its name and the value.
It also has under all an Array containing all variable objects.

## Wiki
* [Message Layout](http://wiki.secondlife.com/wiki/Message_Layout)
* [Packet Layout](http://wiki.secondlife.com/wiki/Packet_Layout)
* [Circuits](http://wiki.secondlife.com/wiki/Circuits)
* [Packet Accounting](http://wiki.secondlife.com/wiki/Packet_Accounting)
