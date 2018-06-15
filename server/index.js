var express = require('express');
var session = require('express-session');
var https = require('https');
var bodyParser = require('body-parser');
var {retrieveUsers, addUserOrUpdateScore, get1000Words} = require('../database/index.js');
var passport = require('./fbAuth');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var app = express();
var authMiddleware = require('./authMiddleWare.js');
var messageRouter = require('./Routers/messages.js');

// Serve static files to the client
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

// START SOCKET FUNCTIONALITY
var io = require('socket.io')(server);

// var server = app.listen(port, () => {
//   console.log(`listening on port ${port}!`);
// });

// MESSAGES ROUTER

app.use('/messages', messageRouter);


// ROOMS STORAGE OBJECT 
// EXAMPLE ROOM:
// roomname: {spectators: [], playersNotReady: [], playersReady: []}
var rooms = {};

// When a user adds a new room, store that room in the ROOMS STORAGE OBJECT
app.post('/gamerooms', (req, res) => {
  var allRooms = Object.keys(rooms);
  if (!allRooms.includes(req.body.newRoom)) {
    rooms['GUDETAMA ' + req.body.newRoom] = { 
      spectators: [], 
      playersNotReady: [], 
      playersReady: [],
      owner: req.user.displayName,
    };
  };
  io.emit('room was submitted');
  res.status(200).send();
})

// When the client requests all existing rooms, send them all of the rooms that have been created
app.get('/gamerooms', (req, res) => {
  res.send(rooms);
});

// Returns the total numbers of players that are READY in a given room to trigger the start of a match
var getReadyPlayerCount = (roomName) => {
  return rooms[roomName].playersReady.length;
}

// Socket events:

var allClients = [];

var playersAndClients = {};

io.on('connection', (socket) => { 
  console.log('a user connected');
  allClients.push(socket.client.id);
  console.log('Clients are:', allClients);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    var i = allClients.indexOf(socket.client.id);
    allClients.splice(i, 1);
    var playerUserName = (_.invert(playersAndClients))[socket.client.id];
    
    //remove the player from all rooms
    if (playerUserName !== undefined) { 
      for (room in rooms) {
        rooms[room].spectators = rooms[room].spectators.filter((user) => user !== playerUserName);
        rooms[room].playersNotReady = rooms[room].playersNotReady.filter((user) => user !== playerUserName);
        rooms[room].playersReady = rooms[room].playersReady.filter((user) => user !== playerUserName);
      }
    }

  });

  socket.on('sent a message', (data) => {
    io.in(data.room).emit('recieve message', {username: data.username, message: data.message});
    //update link of player username to socket id
    playersAndClients[data.username] = socket.client.id;
  });

  socket.on('entering lobby', (data) => {
    //Create socket for client
    socket.join(data.room);
    console.log(data.username, 'joined lobby');
  });

// When the client emits the 'entering room' event join the socket into that room
// push the users chosen username to the NOTREADY list of users
  socket.on('entering room', (data) => {
    // console.log(data.room);
    //Create socket for client
    socket.leave('GUDETAMA lobby');
    socket.join(data.room);
    //Add player to not-ready state
    rooms[data.room].playersNotReady.push(data.username); 
    //update link of player username to socket id
    playersAndClients[data.username] = socket.client.id;
  });

// @Dev team - this is not needed for right now, connection / room is ended when game is over
socket.on('leaving room', (data) => {
  // Users are not part of a room until they click on that room
  // Please note that this will be used in the future when we need to allow room changing.
  socket.leave(data.room);
  console.log(data.username, 'left', data.room);
  if (data.username !== undefined) { 
    rooms[data.room].spectators = rooms[data.room].spectators.filter((user) => user !== data.username);
    rooms[data.room].playersNotReady = rooms[data.room].playersNotReady.filter((user) => user !== data.username);
    rooms[data.room].playersReady = rooms[data.room].playersReady.filter((user) => user !== data.username);
  }
  // console.log('LEAVING A ROOM, THESE ARE THE ROOMS', io.sockets.adapter.rooms);
  //update link of player username to socket id
  playersAndClients[data.username] = socket.client.id;
});

  socket.on('ready', (data) => {
    // Move the user from NOTREADY to READY in the room
    rooms[data.room].playersReady.push(data.username);
    rooms[data.room].playersNotReady = rooms[data.room].playersNotReady.filter((user) => {
      return user !== data.username;
    })
    // Start the game if 2+ users are in the ready state
    if (getReadyPlayerCount(data.room) >= 2) { 
      io.in(data.room).emit('startGame');
      console.log('emmiting start game @', data.room);
    }
    //update link of player username to socket id
    playersAndClients[data.username] = socket.client.id;
  });

  socket.on('i lost', (data) => {
    socket.broadcast.to(data.room).emit('they lost', data);
    // Kick all of the users out of the room
    // Note --> the client provides the user with the option to return to the lobby.

    //loser becomes last in spectators array
    //first in speactators array becomes, players ready
    //winner remains in players ready

    //emit events to clients to handle these client side actions
    rooms[data.room] = { 
      spectators: [], 
      playersNotReady: [], 
      playersReady: []
    };
    //update link of player username to socket id
    playersAndClients[data.username] = socket.client.id;
  });

  socket.on('send words to opponent', function(data) {
    socket.broadcast.to(data.room).emit('receive words from opponent', data);
    //update link of player username to socket id
    playersAndClients[data.username] = socket.client.id;
  });
});

app.get('/lobby', (req, res) => {
  res.redirect('/');
});
app.get('/game', (req, res) => {
  res.redirect('/');
});
app.get('/spectator', (req, res) => {
  res.redirect('/');
});