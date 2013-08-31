(function ($) {
  // socket.io
  var socket = io.connect(window.location.hostname);
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });

  $(document).ready(function () {
    var $stdin = $('#stdin')
    ,   $stdout = $('#stdout')
    ,   $form = $stdin.parent('form');

    $stdin.bind('keypress', function (e) {
      if (e.which == 13) {
        $form.submit();
      }
    });

    $form.on('submit', function (e) {
      e.preventDefault();
      socket.emit('command', {command: $stdin.val()});
      socket.on('command_stdout', function (data) {
        $stdout.append('<pre>stdout: ' + data + '</pre><br>');
        $stdin.val('');
      });
      socket.on('command_stderr', function (data) {
        $stdout.append('<pre>stderr: ' + data + '</pre><br>');
        $stdin.val('');
      });
    });
  })

}(jQuery));
