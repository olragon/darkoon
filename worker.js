var shelljs = require('shelljs');

var sqlmapCmd = 'vendor/sqlmap/sqlmap.py';

shelljs.exec(sqlmapCmd + ' --version', {async: true, silent: true}, function (err, res) {
  console.log(res);
});
