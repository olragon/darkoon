(function ($) {
  // socket.io
  var socket = io.connect(window.location.hostname);

  $(document).ready(function () {
    var $form = $('form#sqlmap')
    ,   $stdout = $('#stdout pre')
    ,   $monitoring = $('#monitoring');

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
      // autoscroll
      if ($(':input[name="autoscroll"]').is(':checked')) {
        $stdout.scrollTop($stdout.get(0).scrollHeight);
      }
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
      var parsed, formData = [];

      /**
       * Parse form boudaries webkit
       */
      if (val.match(/------/)) {
        parsed = val.split(/------/);
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
      } else {
        /**
         * Parse normal webkit form
         */
        parsed = val.split(/\n/);
        $.each(parsed, function (key, item) {
          var parsedItem = item.split(':');
          formData.push(parsedItem[0] + '=' + parsedItem[1]);
        });
        if (formData.length > 0) {
          $(this).val(formData.join('&'));
        }
      }

      // console.log(parsed);
      // console.log(formData.join('&'));
    });

    // monitoring
    socket.on('monitoring', function (data) {
      $monitoring.empty();
      $.each(data, function (key, value) {
        if (typeof value === 'object')  value = JSON.stringify(value, undefined, 2);
        $monitoring.append('<strong>' + key + '</strong>: ' + value + '<br>');
      });
    });

    // clear stdout
    $('#stdout-clear').click(function () {
      $stdout.empty();
      return false;
    });
  });

}(jQuery));
