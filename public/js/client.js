(function ($) {
  // socket.io
  var socket = io.connect(window.location.hostname);

  $(document).ready(function () {
    var $form = $('form#sqlmap')
    ,   $stdout = $('#stdout pre');

    $form.submit(function(e) {
      var cmd = ['sqlmap'];
      var data = $form.serializeJSON();

      jQuery.each(data, function (name, value) {
        if (name != '_options') {
          cmd.push('--' + name + '=' + value);
        } else {
          cmd.push(value);
        }
      });

      socket.emit('command', {command: cmd.join(' ')});
      socket.on('command_stdout', function (data) {
        $stdout.append('stdout: ' + data);
      });
      socket.on('command_stderr', function (data) {
        $stdout.append('stderr: ' + data);
      });

      return false;
    });
  });

}(jQuery));
