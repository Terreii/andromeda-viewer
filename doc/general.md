# General Documentation

## Architecture
The Viewer is seperated into 2 parts:

* Server
* Client

### Server
The server is responsible for:

* Being a web-server and serving the client (HTML, CSS & JS)
* Login
* WebSocket <-> UDP bridge

### Client
The client does most of the work. It receives UDP-packages thru the web-socket connection to the server.

## Login
The client encodes the password using MD5. It then sends all needed information in a [JSON](http://json.org)-string to the server.

The server then adds its own MAC-address and translates the JSON-data to the [XML-RPC-format](https://en.wikipedia.org/wiki/XML-RPC) used for the [login-process](http://wiki.secondlife.com/wiki/Current_login_protocols) of SL.

Second Lifes XML-RPC response will then be translated back to JSON and send to the client as the response of its request.

A WebSocket is then opend by the client. For every WebSocket-connection the server listen on a new UDP-Port, to seperat multiple clients.

**No client-data will be saved server-side**
