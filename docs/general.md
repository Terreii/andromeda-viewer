# General Documentation

## Architecture
The Viewer is consists of 2 parts:

* Server
* Client

### Server
The server handles:

* Serving the client (HTML, CSS & JS)
* Login
* WebSocket <-> UDP bridge

### Client
The client does most of the work. It receives UDP-packages through the web-socket connection to the server.

## Login
The client encodes the password using MD5. It then sends all needed information in a [JSON](http://json.org)-string to the server.

The server then adds its own MAC-address and translates the JSON-data to the [XML-RPC-format](https://en.wikipedia.org/wiki/XML-RPC) used for the [login-process](http://wiki.secondlife.com/wiki/Current_login_protocols) of SL.

The server translates the XML-RPC response to JSON and send and sends it back to the client as the response of its request.

The client will then open a WebSocket back to the server. The server acts as a WebSocket to UDP bridge. For every WebSocket-connection the server listen on a new UDP-Port, to differentiate clients. A lot of Packet types have no way off identifying the target client. Having a port per client fixes this.

**The server keeps no log of the network-data**

## Client View
The client uses the [FLUX](http://facebook.github.io/flux/) model. Where [redux](https://redux.js.org/) manages the state and the view-components are using [React](https://facebook.github.io/react/). And they styled with [Tailwind CSS](https://tailwindcss.com/).
