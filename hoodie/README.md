# Hoodie

In this directory are the [hoodie plugins](http://docs.hood.ie/en/latest/guides/plugins.html) located.

On start `server.js` will get loaded. `client.js` would be the same, but for the client.

## Server

The server is a [`Hapi` server](https://hapijs.com/). The `server.js` will get loaded as a *hapi-plugin*. It will then load following modules:

File | Description
-----|-----
`login.js` | Handles the login process.
`brige.js` | Is the UDP-bridge between client and sim. The client connects with a Web-Socket to it.
`httpProxy.js` | A proxy for all HTTP-requests from the client to a grid.
