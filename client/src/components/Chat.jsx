import React from 'react';
import axios from 'axios';

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      userInput: ''
    }

    this.props.socket.on('recieve message', (messageObj) => {
      var newMessages = this.state.messages.slice();
      newMessages.push(messageObj);
      this.setState({
        messages: newMessages
      });
    });

  }

  componentDidMount() {
    axios.get(`/messages?room=${this.props.room}`).then((response) => {
      this.setState({
        messages: response.data
      })
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    var userInput = this.state.userInput;
    this.setState({
      userInput: ''
    });
    axios.post('/messages', {
      message: userInput,
      username: this.props.username,
      room: this.props.room
    }).then(() => {
      this.props.socket.emit('sent a message', {username: this.props.username, message: userInput, room: this.props.room});
    })
  }

  handleChange(e) {
    this.setState({
      userInput: e.target.value,
    })
  }

  render() {
    return (
      <div className = "chat-box"> 
        <ul className = 'message-list'>
          {this.state.messages.map((messageObj) => {
            return (
            <li>
              <span className = "chat-username"> {messageObj.username}:  </span>
              <span className = "chat-message"> {messageObj.message} </span>
            </li>)
          })}
        </ul>
        <form className = 'send-message' onSubmit = {(e) => {this.handleSubmit(e)}}>
          <input className = 'message-input' type = 'text' onChange = {(e) => {this.handleChange(e)}} value = {this.state.userInput}></input>
        </form>
      </div>
    )
  }

}

export default Chat;