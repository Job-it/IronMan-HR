import React from 'react';
import ReactDOM from 'react-dom';
import Game from './components/Game.jsx';
import Lobby from './components/Lobby.jsx';
import Scoreboard from './components/Scoreboard.jsx';

const io = require('socket.io-client'); 
const socket = io();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      room: 'hardcodedRoom',
      username: '',
      lobbyView: true,
      gameView: false,
    }
    this.handleUserNameChange = this.handleUserNameChange.bind(this);
    this.handleRoomNameClick = this.handleRoomNameClick.bind(this);
    this.playerRoom = prompt('Create or join a room:');

  }

  componentDidMount() {

    this.setState({
      room: this.playerRoom,
    }, () => {
      var c = io.connect(process.env.PORT, {query: this.state.time});
      console.log('c', c);
      socket.emit('entering room', {
        room: 'GUDETAMA ' + this.state.room
      });
    });
  }

  handleUserNameChange(e) {
    this.setState({
      username: e.target.value,
    });
  }

  handleRoomNameClick(clickedRoom) {
    socket.emit('leaving room', {
      room: this.state.room,
      username: undefined,
    });
    console.log(clickedRoom);
    this.setState({
      lobbyView: false,
      gameView: true,
      room: clickedRoom,
    }, () => {
      socket.emit('entering room', {
        room: clickedRoom,
      });
    });
  }



  render() {
    return (
      <div className="app-container">
        <nav>
          <h1>SAVE GUDETAMA!</h1>
        </nav>  
        <div className="game-container">
          {this.state.gameView ? <Game room={this.state.room} username={this.state.username} handleUserNameChange={this.handleUserNameChange} socket={socket}/> : null}
          {this.state.lobbyView ? <Lobby room={this.state.room} username={this.state.username} handleUserNameChange={this.handleUserNameChange} handleRoomNameClick={this.handleRoomNameClick} socket={socket} /> : null}
          {this.state.gameView ? <Scoreboard /> : null}
        </div>
      </div>
    )
  }
}


ReactDOM.render(<App />, document.getElementById('app'));