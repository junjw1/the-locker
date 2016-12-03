var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

var lockers = [
  [0, 0, 0],
  [0, 0, 0]
]

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/admin', function (req, res) {
  res.sendFile(__dirname + '/admin.html');
});

app.get('/lockers', function (req, res) {
  res.send(lockers);
});

io.on('connection', function (socket) {
  //chat-2 클라이언트로부터 받은 이벤트에 대한 작동
  socket.on('chat message', function (msg) {
    //chat-3 모든 클라이언트로 이벤트 전송
    io.emit('chat message', msg);
  });

  socket.on('select', function (data) {
    lockers[data.y][data.x] = 1;
    io.emit('select', data);
  });  

  socket.on('done', function (data) {
    lockers[data.y][data.x] = 0;
    io.emit('done', data);
  });

});

http.listen(3001, function () {
  console.log('listening on *:3001');
});
