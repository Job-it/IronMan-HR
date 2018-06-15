import React from 'react';
import axios from 'axios';
import { Picker } from 'emoji-mart'

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      userInput: '',
      emojiSelectorIsOpen: false
    }

    this.props.socket.on('recieve message', (messageObj) => {
      var newMessages = this.state.messages.slice();
      newMessages.push(messageObj);
      this.setState({
        messages: newMessages
      }, () => {
        //scroll when new messages come in
        var messagesDiv = document.getElementById("messages");
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      });
    });

  }

  componentDidMount() {
    console.log(this.props.room);
    axios.get(`/messages?room=${this.props.room}`).then((response) => {
      this.setState({
        messages: response.data
      }, () => {
        //scroll when new messages come in
        var messagesDiv = document.getElementById("messages");
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
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

  handleEmojiSelect(emoji) {
    this.setState({
      userInput: this.state.userInput + emoji.native
    });
  }

  openEmojiSelector() {
    this.setState({
      emojiSelectorIsOpen: !this.state.emojiSelectorIsOpen
    });
  }

  render() {
    return (
      <div className = "chat-box">
        <h4 id='chat-lobby-title'>{this.props.room}: CHAT</h4>
        <div className ='messages' id='messages'>
          <ul className = 'message-list'>
            {this.state.messages.map((messageObj) => {
              return (
              <li>
                <span className = "chat-username">@{messageObj.username}:  </span>
                <span className = "chat-message"> {messageObj.message} </span>
              </li>)
            })}
          </ul>
        </div>
        <div className ='send-wrapper'>
          <form className = 'send-message' onSubmit = {(e) => {this.handleSubmit(e)}}>
            <input className = 'message-input' type = 'text' onChange = {(e) => {this.handleChange(e)}} value = {this.state.userInput}></input>
          </form>
          <div className = "emoji-opener" onClick = {() => {this.openEmojiSelector()}}>😜 Emoji Menu</div>
          {this.state.emojiSelectorIsOpen ? <Picker style={{ width: '100%' }} onSelect = {(emoji) => {this.handleEmojiSelect(emoji)}} className = 'emoji-selector'/> : <div></div>}
        </div>
      </div>
    )
  }

}

export default Chat;