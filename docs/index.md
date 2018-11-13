# Welcome to Andromeda!

The Andromeda-Viewer is a small text-based chat-client for [Second-Life](https://secondlife.com)™ and [OpenSim](http://opensimulator.org/) based virtual worlds.

## It is not ready to be used!

There is no public server. You have to run a server locally on your own computer.

But you can contribute under the [GitHub repository](https://github.com/Terreii/andromeda-viewer)

## Documentation

You can view the development documentation here.

- To get a general overview of the client, please read the [General documentation](./general.html)!

- [Network documentation](./network.html) documents the protocol between client and server!

- For the data layout in hoodie visit the [synchronizing documentation](./synchronizing.html)!

## How to get started

If you would like to use the viewer or help developing it, you need to run it yourself.

What you need is:

- A [Git](https://git-scm.com/) client. [How to set it up](https://help.github.com/articles/set-up-git/).
- [node.js](https://nodejs.org/) version 8.9.0 or higher.
- [npm](https://npmjs.org/) (Included in node.js).
- And a modern web-browser.

If you have everything installed open a Terminal (on windows `cmd`). Enter following commands to get a copy of the viewer and make it runnable.

```
git clone https://github.com/Terreii/andromeda-viewer.git
cd andromeda-viewer
npm install
npm run build
```

With `npm start` you start a server, which will run the backend of this viewer. To stop the viewer focus your terminal and press ctrl + c.

When the server runs, you can access the viewer in your browser under http://127.0.0.1:8000/.

There is also a live reload mode! Run `npm run watch` and whenever you save a changed file, the viewer/client updates. Without reloading the viewer-state!

`npm run startDev` is a combination of the last two commands.
