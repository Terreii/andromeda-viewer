# Server

In this directory is the [express](https://expressjs.com/)-server located located.

On start `index.js` sets up the server.

The server connects to a [CouchDB](https://couchdb.apache.org/) or
[PouchDB-Server](https://github.com/pouchdb/pouchdb-server) instance.
And uses it for account and session management.

Server needs the [env-variable](https://en.wikipedia.org/wiki/Environment_variable)
`COUCH_URL` set to the *URL of your CouchDB*.
It defaults to __http://localhost:5984__ (standard CouchDB and PouchDB-Server port).

## Files

File | Description
-----|-----
[`index.js`](./index.js) | Is the entry file for the server. It configures and starts the server.
[`db.js`](./db.js) | Setup and common functions for the databases.
[`account.js`](./account.js) | API for accounts. Creating, updating, deleting, login, password reset.
[`login.js`](./login.js) | Handles the grid-login process.
[`gridSession.js`](./gridSession.js) | Utility function to store and validate active grid sessions.
[`bridge.js`](./bridge.js) | Is the UDP-bridge between client and sim. The client connects with a Web-Socket to it.
[`httpProxy.js`](./httpProxy.js) | A proxy for all HTTP-requests from the client to a grid.

## Development

`npm run dev` loads the server-components into the create-react-app-dev-server. Read more in [src/setupProxy.js](../src/setupProxy.js).

When developing the server, run `npm run dev-server`. It is a variant of `npm run dev`, that proxies API-requests to a separate running server.
Then also run the *server* in development with `npm run start-server-dev`.

## PouchDB-Server

PouchDB-Server is accessible under [http://127.0.0.1:5984/_utils](http://127.0.0.1:5984/_utils).

If you want to use CouchDB, then all scripts must get run separately:
- `npm run dev:app` for building the client.
  - If you need a separate server, then `cross-env SERVER=debug npm run dev:app`.
- `npm run dev:style` for building TailwindCSS.
- `npm run start-server-dev` for the server.
