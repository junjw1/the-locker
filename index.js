var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname + '/public'));

mongoose.connect("mongodb://127.0.0.1:27017/scotch-chat");

var lockers = [
  [0, 0, 0],
  [0, 0, 0]
]

// create a schema for chat
var ChatSchema = mongoose.Schema({
  created: Date,
  content: String,
  username: String,
  room: String
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

//This route is simply run only on first launch just to generate some chat history
app.post('/setup', function(req, res) {
  //Array of chat data. Each object properties must match the schema object properties
  var chatData = [{
    created: new Date(),
    content: 'Hi',
    username: 'Chris',
    room: 'php'
  }, {
    created: new Date(),
    content: 'Hello',
    username: 'Obinna',
    room: 'laravel'
  }, {
    created: new Date(),
    content: 'Ait',
    username: 'Bill',
    room: 'angular'
  }, {
    created: new Date(),
    content: 'Amazing room',
    username: 'Patience',
    room: 'socet.io'
  }];

  //Loop through each of the chat data and insert into the database
  for (var c = 0; c < chatData.length; c++) {
    //Create an instance of the chat model
    var newChat = new Chat(chatData[c]);
    //Call save to insert the chat
    newChat.save(function(err, savedChat) {
      console.log(savedChat);
    });
  }
  //Send a resoponse so the serve would not get stuck
  res.send('created');
});

//This route produces a list of chat as filterd by 'room' query
app.get('/msg', function(req, res) {
  //Find
  Chat.find({
    'room': req.query.room.toLowerCase()
  }).exec(function(err, msgs) {
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
