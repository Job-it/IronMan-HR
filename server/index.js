var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var {retrieveUsers, addUserOrUpdateScore, get1000Words} = require('../database/index.js');
var passport = require('./fbAuth');
var fs = require('fs');
var path = require('path');
var https = require('https');
var app = express();
var authMiddleware = require('./authMiddleWare.js');

app.use(express.static(__dirname + '/../client/dist'));
app.use(bodyParser.json());

app.use(session({
  secret: 'CRAZYSUPERSECRET',
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(authMiddleware);

//Authentication 
app.get('/users', (req, res) => {
  res.send();
})

app.get('/logout', ((req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
}));

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/'
  }));

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

var certOptions = {
  key: fs.readFileSync(path.resolve('server.key')),
  cert: fs.readFileSync(path.resolve('server.crt'))
}

var server = https.createServer(certOptions, app).listen(port, function() {
  console.log(`listening on port ${port}!`);
});

var io = require('socket.io')(server);

// an object to store what users are in what rooms
var rooms = {};

// count the players in each room
var getPlayerCount = (roomName) => {
  var playerCount = 0;
  for (var player in rooms[roomName]) {
    playerCount += rooms[roomName][player];
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
  });

  socket.on('leaving room', (data) => {
    socket.leave(data.room);
    rooms[data.room][data.username] = 0;
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
    if (getPlayerCount(data.room) === 2) { //start the game with 2 players in the room
      io.in(data.room).emit('startGame');
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
