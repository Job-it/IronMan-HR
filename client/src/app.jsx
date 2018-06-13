import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import Game from './components/Game.jsx';
import Lobby from './components/Lobby.jsx';
import Scoreboard from './components/Scoreboard.jsx';
import Login from './components/Login.jsx';
import axios from 'axios'

const io = require('socket.io-client'); 
const socket = io();

var c = io.connect(process.env.PORT);
console.log('c', c);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      room: 'hardcodedRoom',
      username: false,
    }
    this.handleUserNameChange = this.handleUserNameChange.bind(this);
    this.handleRoomNameClick = this.handleRoomNameClick.bind(this);
    this.addRoom = this.addRoom.bind(this);
  }

  componentDidMount() {
    axios.get('/users')
      .then((response) => {
        if (response.headers.user) {
          var user = JSON.parse(response.headers.user);
        } else {
          var user = undefined;
        }
        if (user === undefined) {
          this.props.history.push('/login');
        } else {
          this.props.history.push('/lobby');
        }
      })
  }

  addRoom() {
    //IF YOU ADD TWO ROOMS, MAKE SURE YOU LEAVE THE FIRST
    //BEFORE JOINING THE SECOND
    socket.emit('leaving room', {
      room: 'GUDETAMA ' + this.state.room,
    });

    var playerRoom = prompt('Create or join a room:');

    axios.post('/rooms', {newRoom: playerRoom});

  }

  handleUserNameChange(e) {
    this.setState({
      username: e.target.value,
    });
  }

  handleRoomNameClick(clickedRoom) {
    this.setState({
      room: clickedRoom,
    }, () => {
      var c = io.connect(process.env.PORT, {query: this.state.time});
      console.log('c', c);
      socket.emit('entering room', {
        room: clickedRoom,
        username: this.state.username
      });
      this.props.history.push('/game');
    });
  }

  logout() {
    axios.get('/logout').then(() => {
      this.props.history.push('/login');
    })
  }

  render() {
    return (
      <div className="app-container">
        <Route path='/lobby' render={ (props) => <Lobby {...props} 
          room={this.state.room}
          username={this.state.username}
          handleUserNameChange={this.handleUserNameChange}
          handleRoomNameClick={this.handleRoomNameClick}
          socket={socket}
          addRoom={this.addRoom}/> 
        }/>
        <Route path = '/game' render = {
          (props) => {
            return (<div>
              <nav>
                <h1>SAVE GUDETAMA!</h1>
                <div>
                <button onClick = {() => {this.logout()}} >Logout</button>
                </div>
              </nav>  
              <div className="game-container">
                <Game {...props} socket={socket} room={this.state.room} username={this.state.username} handleUserNameChange={this.handleUserNameChange} history = {this.props.history}/>
                <Scoreboard {...props} />
              </div>
            </div>);
          }
        }/>
        <Route path = '/login' render = {
          (props) => {
            return (
              <div>
                <Login />
              </div>
            );
          }
        }/>
      </div>
    )
  }
}

export default withRouter(App);

// make a mvp login route (client);
// One component, one html tag, one link --> /auth/facebook
// on component did mount - send get to server 
// parse response for user data in header
// deal with the request on the server
// conditionally route user