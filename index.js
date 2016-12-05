var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose'); //MongoDB와 상호작용을 쉽게 해주는 모듈

app.use(express.static(__dirname + '/public'));

//몽고디비에 연결
mongoose.connect("mongodb://127.0.0.1:27017/simpe-chat");

//사물함
var lockers = [
  [0, 0, 0],
  [0, 0, 0]
]

// 채팅 스키마 작성
var ChatSchema = mongoose.Schema({
  created: Date,
  content: String,
  username: String
});

// 채팅 스키마로부터 모델 만들기
var Chat = mongoose.model('Chat', ChatSchema);

//채팅 로그 기록 보기
app.get('/log', function(req, res) {
  //DB에 저장된 데이터 불러오기
  Chat.find().exec(function(err, msgs) {
    //json 형식으로 데이터 보여주기
    res.json(msgs);
  });
});

//사용자 용 웹페이지
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//관리자 용 웹페이지
app.get('/admin', function (req, res) {
  res.sendFile(__dirname + '/admin.html');
});

//사물함 정보 요청
app.get('/lockers', function (req, res) {
  res.send(lockers);
});

io.on('connection', function (socket) {
  //chat-2 클라이언트로부터 받은 'chat message 이벤트'에 대한 작동
  socket.on('chat message', function (chat) {
    //메세지 객체 만들기
    var newMsg = new Chat({
      username: chat.from,
      content: chat.msg,
      created: new Date()
    });
    //메세지 객테를 DB로 저장
    newMsg.save();

    //chat-3 모든 클라이언트로 'chat message 이벤트' 전송
    io.emit('chat message', chat);
  });

  //락커 사용 이벤트
  socket.on('select', function (data) {
    //락커가 사용 불가능을 의미
    lockers[data.y][data.x] = 1;
    io.emit('select', data);
  });  

  //락커 처리 완료 이벤트
  socket.on('done', function (data) {
    //락커 사용 가능을 의미
    lockers[data.y][data.x] = 0;
    io.emit('done', data);
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
