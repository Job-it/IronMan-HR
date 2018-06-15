import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import Game from './components/Game.jsx';
import Lobby from './components/Lobby.jsx';
import Scoreboard from './components/Scoreboard.jsx';
import Login from './components/Login.jsx';
import Chat from './components/Chat.jsx'
import axios from 'axios'
import Spectator from './components/Spectator.jsx';


const io = require('socket.io-client'); 
const socket = io();

// var c = io.connect(process.env.PORT);
// console.log('c', c);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      room: 'GUDETAMA lobby',
      username: false,
      soundOn: false,
    };
    this.handleUserNameChange = this.handleUserNameChange.bind(this);
    this.handleRoomNameClick = this.handleRoomNameClick.bind(this);
    this.addRoom = this.addRoom.bind(this);
    this.setRoomToLobby = this.setRoomToLobby.bind(this);
    this.toggleSound = this.toggleSound.bind(this);
  }

  componentDidMount() {
    axios.get('/users')
      .then((response) => {
        if (response.headers.user) {
          var user = JSON.parse(response.headers.user);
          this.setState({
            // username: user.displayName
            username: user.displayName,
          })
        } else {
          var user = undefined;
        }
        if (user === undefined) {
          this.props.history.push('/login');
        } else {
          this.props.history.push('/lobby');
        }
      });
  }

  addRoom() {
    var playerRoom = prompt('Create or join a room:');
    if (playerRoom !== null) {
      axios.post('/rooms', {newRoom: playerRoom});
    }
  }

  handleUserNameChange(e) {
    this.setState({
      username: e.target.value,
    });
  }

  setRoomToLobby() {
    this.setState({
      room: 'GUDETAMA lobby',
    })
    this.props.socket.emit('entering lobby', {room: 'GUDETAMA lobby'});
  }

  handleRoomNameClick(clickedRoom) {
    this.setState({
      room: clickedRoom,
    }, () => {
      // var c = io.connect(process.env.PORT, {query: this.state.time});
      // console.log('c', c);
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

  toggleSound() {
    this.setState({
      soundOn: !this.state.soundOn
    }, () => {
      if (!this.state.soundOn) {
        stopStart();
      } else {
        playStart();
      }
    });
  }

  render() {
    return (
      <div className="app-container">
        <Route path='/lobby' render = { (props) => 
          <div className = "lobby-display">
            <Lobby {...props} 
            handleLogout = {() => {
              this.logout()
            }}
            toggleSound={this.toggleSound}
            soundOn={this.state.soundOn}
            room={this.state.room}
            username={this.state.username}
            handleUserNameChange={this.handleUserNameChange}
            handleRoomNameClick={this.handleRoomNameClick}
            socket={socket}
            addRoom={this.addRoom}/>
            <div className = 'lobby-right'>
            <div className='lobby-sidebar-wrapper'>
                  <Scoreboard {...props} />
                  <h2 id='chat-lobby-title'>Chat</h2>
                  <div className='in-game-chat-wrapper'>{this.state.username ? <Chat {...props} room = {this.state.room} username = {this.state.username} socket={socket} /> : null }</div>
            </div>
              <button className="sound-btn" onClick={() => this.toggleSound()}> { this.state.soundOn ? <div>😜🎵</div> : <div>🔇😭</div> } </button>
            </div>
          </div>
        }/>
        <Route path = '/game' render = {
          (props) => {
            return (<div>
              <nav>
                <h1>SAVE GUDETAMA!</h1>
              </nav>  
              <div className="game-container">
                <Game {...props} toggleSound={this.toggleSound} soundOn={this.state.soundOn} socket={socket} room={this.state.room} setRoomToLobby={this.setRoomToLobby} username={this.state.username} handleUserNameChange={this.handleUserNameChange} history = {this.props.history}/>
                <div className='sidebar-wrapper'>
                  <Scoreboard {...props} />
                  <div className='in-game-chat-wrapper'><Chat {...props} room = {this.state.room} username = {this.state.username} socket={socket} /></div>
                </div>
                <button className="sound-btn" onClick={() => this.toggleSound()}>{ this.state.soundOn ? <img src="../assets/speakerOn.png" /> : <img src="../assets/mute.png" /> }</button>
              </div>
            </div>);
          }
        }/>
        <Route path = '/spectator' render = {
          (props) => {
            return (<div>
              <nav>
                <h1>SAVE GUDETAMA!</h1>
              </nav>  
              <div className="game-container">
                <Spectator {...props} socket={socket} room={this.state.room} setRoomToLobby={this.setRoomToLobby} username={this.state.username} handleUserNameChange={this.handleUserNameChange} history = {this.props.history}/>
                <div className='sidebar-wrapper'>
                  <Scoreboard {...props} />
                  <div className='in-game-chat-wrapper'><Chat {...props} room = {this.state.room} username = {this.state.username} socket={socket} /></div>
                </div>
                <button className="sound-btn" onClick={() => this.toggleSound()}>{ this.state.soundOn ? <img src="../assets/speakerOn.png" /> : <img src="../assets/mute.png" /> }</button>
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