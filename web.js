var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , spawn = require('child_process').spawn
  , fs = require('fs')
  , os = require('os');


// sqlmap symlink
var sqlmapPath = __dirname + '/vendor/sqlmap/sqlmap.py';
if (fs.existsSync(sqlmapPath)) {
  fs.symlinkSync(__dirname + '/vendor/sqlmap/sqlmap.py', __dirname + '/node_modules/.bin/sqlmap');
} else {
  console.error('sqlmap not found!');
}

/**
 * Monitoring
 */
function getSystemInfo() {
  var osMethods = Object.keys(os);
  var monitor = {};
  for (var _i=0; _i<osMethods.length; _i++) {
    if (typeof os[osMethods[_i]] == 'function') {
      monitor[osMethods[_i]] = os[osMethods[_i]]();
    } else {
      monitor[osMethods[_i]] = os[osMethods[_i]];
    }
  }
  return monitor;
}

var childsProcess = {};

app.use(express.static('./public'));

server.listen(process.env.PORT || 9999);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {

  socket.on('echo', function (data) {
    console.log(data);
    socket.emit('response', data);
  });

  socket.on('command', function (data) {
    console.log('[web.js] receive command', data);
    var cmdParsed = parseCommand(data.command);
    console.log('[web.js] parsed command', cmdParsed);
    var cmd = spawn(cmdParsed.cmd, cmdParsed.args);
    childsProcess[socket.id] = cmd;

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
      delete childsProcess[socket.id];
    });
  });

  /**
   * Socket disconnect, kill all process
   * @return {[type]} [description]
   */
  socket.on('disconnect', function () {
    console.log('[web.js] user ' + socket.id + ' disconnect');
    if (childsProcess[socket.id]) {
      console.log('[web.js] kill runnung command');
      childsProcess[socket.id].kill();
      delete childsProcess[socket.id];
    }
  });

  setInterval(function () {
    socket.emit('monitoring', getSystemInfo());
  }, 10000);

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
