var shelljs = require('shelljs');

shelljs.exec('sqlmap --version', {async: true, silent: true}, function (err, res) {
  console.log(res);
});
