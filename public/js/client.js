(function ($) {
  // socket.io
  var socket = io.connect(window.location.hostname);

  $(document).ready(function () {
    var $form = $('form#sqlmap')
    ,   $stdout = $('#stdout pre');

    /**
     * Auto calculate output height
     * @return {[type]} [description]
     */
    var autoHeight = function () {
      var height = $(window).height() - $('#stdout').offset().top;
      $stdout.css('height', height - 20);
    };
    autoHeight();
    $(window).resize(function () {
      autoHeight();
    });

    /**
     * Scroll
     */
    var autoScroll = function () {
      $stdout.animate({ scrollTop: $stdout.get(0).scrollHeight }, 1000);
    }

    // console.log($('#stdout').offset().top);
    // console.log($(window).height());

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
        autoScroll();
      });
      socket.on('command_stderr', function (data) {
        $stdout.append('stderr: ' + data);
        autoScroll();
      });

      return false;
    });

    // format post data
    $form.find(':input[name="data"]').change(function () {
      var val = $(this).val();
      var parsed, formData;

      if (val.match(/------/)) {
        parsed = val.split(/------/);
        formData = [];
        if (parsed && parsed.length > 0) {
          for (var _i=0; _i<parsed.length; _i++) {
            parsed[_i] = parsed[_i].trim();
            var matchName = parsed[_i].match(/(name=")([^"]+)/);
            var matchValue = parsed[_i].match(/[^"]+$/);
            var name, value = '';
            if (matchValue) {
              matchValue[0] = matchValue[0].trim();
              value = matchValue[0] || '';
            }
            if (matchName) {
              name = matchName[2];
              formData.push(name + '=' + value);
            }
          }
        }
        $(this).val(formData.join('&'));
      }

      console.log(parsed);
      console.log(formData.join('&'));
    });
  });

}(jQuery));
