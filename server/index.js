var express = require('express');
var bodyParser = require('body-parser');
var {retrieveUsers, addUserOrUpdateScore, get1000Words} = require('../database/index.js');

var app = express();

app.use(express.static(__dirname + '/../client/dist'));
app.use(bodyParser.json());

// querying all users and scores from the database 
app.get('/wordgame', (req, res) => { 
  retrieveUsers((data) => {
    res.send(data);
  });
});

// at end of game, add to or update db with username and high score
app.post('/wordgame', (req,res) => {
  addUserOrUpdateScore(req.body, (results) => {
    res.status(201).send(results);
  });
});

// get words from dictionary, send back to client
app.get('/dictionary', (req, res) => {
  get1000Words((results) => {
    res.send(results);
  });
});

var port = process.env.PORT || 5000;

var server = app.listen(port, function() {
  console.log(`listening on port ${port}!`);
});

var io = require('socket.io')(server);

// an object to store what users are in what rooms
var rooms = {};

//send user the number of active game rooms
app.get('/gamerooms', (req, res) => {
  var gameRooms = io.sockets.adapter.rooms;
  res.send(gameRooms);
});

// count the players in each room
var getPlayerCount = (roomName) => {
  var playerCount = 0;
  for (var player in rooms[roomName]) {
    playerCount += rooms[roomName][player];
    //console.log(roomName, player, playerCount);
  }
  return playerCount;
}

// all socket logic:
io.on('connection', (socket) => { 
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('entering room', (data) => {
    socket.join(data.room);
    console.log(io.sockets.adapter.rooms);
  });

  socket.on('leaving room', (data) => {
    socket.leave(data.room);
    if (data.username !== undefined) {
      rooms[data.room][data.username] = 0;
    }
    if (getPlayerCount(data.room) === 0) {
      delete rooms[data.room];
    }
    console.log('leaving room, rooms is', rooms);
  });

  socket.on('ready', (data) => {
    if (!rooms[data.room]) {
      rooms[data.room] = {};
    }; 
    rooms[data.room][data.username] = 1; 
    console.log('ready, rooms is', rooms);
    console.log(data);
    if (getPlayerCount(data.room) === 2) { //start the game with 2 players in the room
      io.in(data.room).emit('startGame');
      console.log('emmiting start game @', data.room);
    }
  });

  socket.on('i lost', (data) => {
    socket.broadcast.to(data.room).emit('they lost', data.score);
    rooms[data.room][data.username] = 0;
    console.log('i lost, rooms is', rooms);
  });

  socket.on('send words to opponent', function(data) {
    socket.broadcast.to(data.room).emit('receive words from opponent', data.newWords);
  });
});
