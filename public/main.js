var socket = io();
      var onClickLocker;
      $(document).ready(function () {
            onClickLocker = function () {
                var x = $(this).attr('data-x');
                var y = $(this).attr('data-y');

                if (confirm('좌석을 예약하시겠습니까?')) {
                    $(this).off('click');
                    //서버한테 이벤트 전송
                    socket.emit('select', {
                        x: x,
                        y: y
                    });
                } else {
                    alert('취소되었습니다.');
                }
            };

            // Ajax를 수행 - get http 요청으로 서버로부터 json형식의 데이터를 로드
            $.getJSON('/lockers', { dummy: new Date().getTime() }, function (data) {
                // 좌석을 생성
                $.each(data, function (indexY, line) {
                    // 문서 객체를 생성
                    var $line = $('<div></div>').addClass('line');
                    $.each(line, function (indexX, locker) {
                        // 문서 객체를 생성하고 변수 $line에 추가
                        var $output = $('<div></div>', {
                            'class': 'locker',
                            'data-x': indexX,
                            'data-y': indexY
                        }).appendTo($line);

                        if (locker == 0) {
                            // 사물함이 비어 있으면 enable 클래스와 click 리스너를 추가
                            $output.addClass('enable').on('click', onClickLocker);
                        } else if (locker == 1) {
                            // 사물함 사용 불가능하면 disable 클래스를 추가
                            $output.addClass('disable');
                        }
                    });
                    // 문서 객체를 추가
                    $line.appendTo('div#lockers');
                });
            });
        });

      socket.on('select', function (data) {
          var $target = $('div[data-x = ' + data.x + '][data-y = ' + data.y + ']');
          $target.removeClass('enable');
          $target.addClass('disable');
          // alert( $target.attr('class'));
      });
      socket.on('done', function (data) {
          var $target = $('div[data-x = ' + data.x + '][data-y = ' + data.y + ']');
          $target.removeClass('disable');
          $target.addClass('enable').on('click', onClickLocker);
      });

      $('form').submit(function(){
        //chat-1 서버로 이벤트 전송
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
      });

      //chat-4 서버로부터 받은 이벤트에 대한 처리
      socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
      });      
      