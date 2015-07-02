var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Andromeda Viewer\n');
}).listen(process.env.PORT || 8000, process.env.IP);

console.log('Andromeda is running!\nNot ready for production!');
