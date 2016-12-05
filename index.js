var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname + '/public'));

mongoose.connect("mongodb://127.0.0.1:27017/simpe-chat");

var lockers = [
  [0, 0, 0],
  [0, 0, 0]
]

// create a schema for chat
var ChatSchema = mongoose.Schema({
  created: Date,
  content: String,
  username: String
});

// create a model from the chat schema
var Chat = mongoose.model('Chat', ChatSchema);

// allow CORS
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

//데이터베이스 채팅 로그 보기
app.get('/log', function(req, res) {
  //Find
  Chat.find().exec(function(err, msgs) {
    //Send
    res.json(msgs);
  });
});

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
  //chat-2 클라이언트로부터 받은 'chat message'라는 이벤트에 대한 작동
  socket.on('chat message', function (chat) {
    //Create message
    var newMsg = new Chat({
      username: chat.from,
      content: chat.msg,
      created: new Date()
    });
    //Save it to database
    newMsg.save();

    //chat-3 모든 클라이언트로 이벤트 전송
    io.emit('chat message', chat);
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

http.listen(3000, function () {
  console.log('listening on *:3000');
});
