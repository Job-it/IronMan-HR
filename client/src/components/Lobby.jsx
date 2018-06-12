import React from 'react';
import axios from 'axios';


class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customRoomName: '',
      rooms: [],
    }

    this.getGameRoomsAndSetState = this.getGameRoomsAndSetState.bind(this);
    this.handleUserNameSubmit = this.handleUserNameSubmit.bind(this);
  }

  componentDidMount() {
    //
  }

  handleUserNameSubmit(e) {
    e.preventDefault();
    this.getGameRoomsAndSetState();
  }

  getGameRoomsAndSetState() {
    axios.get('/gamerooms')
    .then((res) => {
      var roomsFromServer = Object.keys(res.data).filter((roomName) => roomName.includes('GUDETAMA'));
      this.setState({
        rooms: roomsFromServer,
      }, () => {
        console.log(this.state.rooms);
      })
    })
  }


  render() {
    return (
      <div>
        <form id="starter-form" onSubmit={(e) => this.handleUserNameSubmit(e)} autoComplete="off">
          <input id="user-input" placeholder="Who are you?" value={this.props.username} onChange={this.props.handleUserNameChange} autoFocus/>
        </form>
        <button onClick={this.getGameRoomsAndSetState}>Update Room List</button>
        Room List:
        <ul>
          {this.state.rooms.map((room) => <li onClick={() => this.props.handleRoomNameClick(room) }>{room}</li>)}
        </ul>
      </div>
    )
  }
}

export default Lobby;