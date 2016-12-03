var socket = io();
      var onClickLocker;

      $(document).ready(function () {
            onClickLocker = function () {
                var x = $(this).attr('data-x');
                var y = $(this).attr('data-y');

                if (confirm('처리 완료')) {
                    $(this).off('click');
                    socket.emit('done', {
                        x: x,
                        y: y
                    });
                } else {
                    alert('취소되었습니다.');
                }
            };

            // Ajax를 수행
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

                        if (locker == 1) {
                            // 사물함이 사용 중이면 using 클래스와 click 리스너를 추가
                            $output.addClass('using').on('click', onClickLocker);
                        } else if (locker == 0) {
                            // 사물함을 처리해서 비워지면 empty 클래스 추가
                            $output.addClass('empty');
                        }
                    });
                    // 문서 객체를 추가
                    $line.appendTo('div#lockers');
                });
            });
        });
        socket.on('select', function (data) {
            var $target = $('div[data-x = ' + data.x + '][data-y = ' + data.y + ']');
            $target.removeClass('empty');
            $target.addClass('using').on('click', onClickLocker);
        });
        socket.on('done', function (data) {
            var $target = $('div[data-x = ' + data.x + '][data-y = ' + data.y + ']');
            $target.removeClass('using');
            $target.addClass('empty');
        });

        $('form').submit(function(){
            socket.emit('chat message', $('#m').val());
            $('#m').val('');
            return false;
        });
        socket.on('chat message', function(msg){
            $('#messages').append($('<li>').text(msg));
        });