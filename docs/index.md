# Welcome to Andromeda!

The Andromeda-Viewer is a small text-based chat-client for [Second-Life](https://secondlife.com)™ and [OpenSim](http://opensimulator.org/) based virtual worlds.

## It is not ready to be used!

There is no public server. You have to run a server locally on your own computer.

But you can contribute under the [GitHub repository](https://github.com/Terreii/andromeda-viewer)

## Documentation

You can view the documentation here. It exists correctly only to help development.

- To get a general overview of the client, please read the [General documentation](./general.html)!

- How the network operates is described in [Network documentation](./network.html)!

- You will get a understanding of the UI in its [documentation](./ui.html)!

- For the data layout in hoodie visit the [synchronizing documentation](./synchronizing.html)!

## How to get started

If you would like to use the viewer or help developing it, you need to run it yourself.

What you need is:

- A [Git](https://git-scm.com/) client. [How to set it up](https://help.github.com/articles/set-up-git/).
- [node.js](https://nodejs.org/) version 6.9.0 or higher.
- [npm](https://npmjs.org/) (Included in node.js).
- And a modern web-browser.

If you have everything installed open a Terminal (on windows `cmd`). Enter following commands to get a copy of the viewer and make it runnable.

```
git clone https://github.com/Terreii/andromeda-viewer.git
cd andromeda-viewer
npm install
npm run build
```

With `npm start` you start a server, which will run the backend of this viewer. To stop the viewer fokus your terminal and press ctrl + c.

When the server runs, you can access the viewer in your browser under http://127.0.0.1:8000/.
