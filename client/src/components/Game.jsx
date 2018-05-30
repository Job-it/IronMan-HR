import React from 'react';
import Brick from './Brick.jsx';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInput: '',
      words: ["my", "name", "is", "joe"],
      time: 0,
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({
      userInput: e.target.value,
    })
  }

  handleSubmit(e) {
    e.preventDefault();
    var index = this.state.words.indexOf(this.state.userInput);
    
    if (index !== -1) {
      var newWords = this.state.words.slice();
      newWords.splice(index, 1);
      this.setState({
        userInput: '',
        words: newWords,
      })
    }
  }

  render() {
    return (
      <div className="game">
        <p>game</p>
        {this.state.words.map((word, index) => {
          return <Brick word={word} key={index} />
        })}
        <form onSubmit={this.handleSubmit}>
          <input value={this.state.userInput} onChange={this.handleChange} />
        </form>
      </div>
    )
  }

}


export default Game;