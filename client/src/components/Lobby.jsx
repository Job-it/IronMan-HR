import React from 'react';
import {Trail} from 'react-spring';
import axios from 'axios';


class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customRoomName: '',
      rooms: [],
      roomNameInput: ''
    }

    this.props.socket.on('room was submitted', () => {
      this.getGameRoomsAndSetState();
    });

    this.getGameRoomsAndSetState = this.getGameRoomsAndSetState.bind(this);
  }

  componentDidMount() {
    this.props.socket.emit('entering lobby', {room: 'GUDETAMA lobby'});
    this.getGameRoomsAndSetState();
  }


  // Deprecated --> potentially use for setting nicknames
  // handleUserNameSubmit(e) {
  //   e.preventDefault();
  //   console.log('submitted');
  //   this.getGameRoomsAndSetState();
  // }

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
        {/* {this.state.userNameSubmitted ? <div></div> : <form id="starter-form" onSubmit={(e) => this.handleUserNameSubmit(e)} autoComplete="off">
          <input id="user-input" placeholder="Who are you?" onChange={this.props.handleUserNameChange} autoFocus/>
        </form>} */}
        <div className='lobby-user-info'>
          <button onClick = {this.props.handleLogout}>Logout</button>
          <p>{this.props.username}</p>
        </div>
        <div id='lobby-room-list'>
        <h2 id='game-room-header'>Game Rooms:</h2>
        <div className = 'lobby-room-btns'>
          <button onClick = {this.getGameRoomsAndSetState}>Update Room List</button>
          <button onClick = {() => {this.addRoomAndGetNewRooms()}} >Add Room</button>
        </div>
          <ul>
          <Trail from={{ opacity: 0 }} to={{ opacity: 1 }} keys = {Object.keys(this.state.rooms).map(room => room)}>
            { Object.keys(this.state.rooms).map((room) => styles => {
              return (
                <li style = {styles} className = 'room-details' onClick={() => this.props.handleRoomNameClick(room) }>
                  <span className = 'room-name-header'>{room}</span>
                  <br/>
                  <span className = 'tiny-details'>In Room: <span className = 'tiny-details-number'> {this.state.rooms[room].playersNotReady.length === 0 ? 'EMPTY' : this.state.rooms[room].playersNotReady} </span> </span><br/>
                  <span className = 'tiny-details'>Ready: <span className = 'tiny-details-number'> {this.state.rooms[room].playersReady.length === 0 ? 'EMPTY' : this.state.rooms[room].playersReady} </span> </span><br/>
                  <span className = 'tiny-details'>Watching: <span className = 'tiny-details-number'> {this.state.rooms[room].spectators.length === 0 ? 'EMPTY' : this.state.rooms[room].spectators} </span> </span>
                </li>
              )
            }) }
          </Trail>
          
          </ul>
        </div>
      </div>
    )
  }
}

export default Lobby;