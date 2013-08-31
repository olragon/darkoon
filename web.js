var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , spawn = require('child_process').spawn
  , fs = require('fs');


// sqlmap symlink
var sqlmapPath = __dirname + '/vendor/sqlmap/sqlmap.py';
if (fs.existsSync(sqlmapPath)) {
  fs.symlinkSync(__dirname + '/vendor/sqlmap/sqlmap.py', __dirname + '/node_modules/.bin/sqlmap');
} else {
  console.error('sqlmap not found!');
}

app.use(express.static('./public'));

server.listen(process.env.PORT || 9999);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('command', function (data) {
    var cmdParsed = parseCommand(data.command);
    var cmd = spawn(cmdParsed.cmd, cmdParsed.args);
    cmd.stdout.setEncoding('utf8');
    cmd.stdout.on('data', function (data) {
      socket.emit('command_stdout', data);
    });
    cmd.stderr.setEncoding('utf8');
    cmd.stderr.on('data', function (data) {
      socket.emit('command_stderr', data);
    });
    cmd.on('close', function (code) {
      socket.emit('command_stdout', code);
    });
  });
});

function parseCommand(command) {
  var cmdArgs = command.split(' ');
  var cmd = cmdArgs[0];
  cmdArgs.splice(0, 1);
  return {
    cmd: cmd,
    args: cmdArgs
  }
}
