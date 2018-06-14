import React from 'react';
import axios from 'axios';


class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customRoomName: '',
      rooms: [],
      userNameSubmitted: false,
      roomNameInput: ''
    }

    this.getGameRoomsAndSetState = this.getGameRoomsAndSetState.bind(this);
    this.handleUserNameSubmit = this.handleUserNameSubmit.bind(this);
  }

  componentDidMount() {
    this.props.socket.emit('entering lobby', {room: 'GUDETAMA lobby'});
  }

  handleUserNameSubmit(e) {
    e.preventDefault();
    console.log('submitted');
    this.setState({
      userNameSubmitted: true
    });
    this.getGameRoomsAndSetState();
  }

  handleRoomNameChange(e) {
    this.setState({
      roomNameInput: e.target.value
    })
  }

  addRoomAndGetNewRooms() {
    this.props.addRoom();
    this.getGameRoomsAndSetState();
  }

  getGameRoomsAndSetState() {
    axios.get('/gamerooms')
    .then((res) => {
      console.log(res.data);
      this.setState({
        rooms: res.data,
      });
    });
  }


  render() {
    return (
      <div id='lobby-room-list-wrapper'>
        {this.state.userNameSubmitted ? <div></div> : <form id="starter-form" onSubmit={(e) => this.handleUserNameSubmit(e)} autoComplete="off">
          <input id="user-input" placeholder="Who are you?" onChange={this.props.handleUserNameChange} autoFocus/>
        </form>}
        <button onClick={this.getGameRoomsAndSetState}>Update Room List</button>
        {this.state.userNameSubmitted ? <button onClick = {() => {this.addRoomAndGetNewRooms()}} >Add Room</button> : <div></div>}
        <div id='lobby-room-list'>
        <h2>Game Rooms:</h2>
          <ul>
            { Object.keys(this.state.rooms).map((room) => {
              return (
                <li className = 'room-details' onClick={() => this.props.handleRoomNameClick(room) }>
                  <span className = 'room-name-header'>{room}</span>
                  <br/>
                  <span className = 'tiny-details'>In Room: {this.state.rooms[room].playersNotReady.length === 0 ? 'NO ONE | ' : this.state.rooms[room].playersNotReady + ' | '}</span>
                  <span className = 'tiny-details'>Ready: {this.state.rooms[room].playersReady.length === 0 ? 'NO ONE | ' : this.state.rooms[room].playersReady + ' | '}</span>
                  <span className = 'tiny-details'>Watching: {this.state.rooms[room].spectators.length === 0 ? 'NO ONE | ' : this.state.rooms[room].spectators}</span>
                </li>
              )
            }) }
          </ul>
        </div>
      </div>
    )
  }
}

export default Lobby;