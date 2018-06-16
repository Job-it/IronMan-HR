import React from 'react';
import Brick from './Brick.jsx';
import axios from 'axios';

class Spectator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInput: '',
      dictionary: {},
      words: [],
      theirWords: [],
      time: 0,
      timeInterval: 1000,
      round: 'all',
      instructions: ["Humpty Dumpty sat on a wall,", "Humpty Dumpty had a great fall.", "All the king's horses and all the king's men", "Couldn't put Humpty together again.", "HURRY - KEEP TYPING TO PREVENT HIS DEMISE!"],
      prompt: 'START GAME',
      opponentTime: 0,
      userNameSelected: false,
      gameover: false,
      p1Name: undefined,
      p2Name: undefined,
      p1Score: 0,
      p2Score: 0,
    }
    
    this.goToLobby = this.goToLobby.bind(this);
    this.addWord = this.addWord.bind(this);
    this.updateOpponentWordList = this.updateOpponentWordList.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sendScore = this.sendScore.bind(this);
    this.stopGame = this.stopGame.bind(this);


    this.props.socket.on('receive words from opponent', (data) => {
      // this.updateOpponentWordList(words);
      console.log(data.userName, data.newWords);

      if (data.userName === this.state.p1Name) {
        this.setState({
          words: data.newWords,
          p1Score: data.score,
        })
      } else if(data.userName === this.state.p2Name) {
        this.setState({
          theirWords: data.newWords,
          p2Score: data.score,
        })
      } else if (this.state.p1Name === undefined) {
        this.setState({
          p1Name: data.userName,
        })
      } else if (this.state.p2Name === undefined) {
        this.setState({
          p2Name: data.userName,
        })
      }

    });

    this.props.socket.on('they lost', (data) => {
      // this is bad, eventually put a red x over their bricks or something
      if (this.state.p2Score > this.state.p1Score) {
        document.getElementById('our-game').style.backgroundColor = "red";
        document.getElementById('their-game').style.backgroundColor = "green";
      } else if ( this.state.p1Score > this.state.p2Score) {
        document.getElementById('our-game').style.backgroundColor = "green";
        document.getElementById('their-game').style.backgroundColor = "red";
      }
    });
  }

  // get words from dictionary and join this.props.socket
  componentDidMount() {
    this.props.socket.emit('entering room', {
      room: this.props.room,
      username: this.props.username,
    });
  }

  // leave this.props.socket
  componentWillUnmount() {  
    this.props.socket.emit('leaving room', {
      room: this.props.room,
      username: this.props.username,
    });
  }


  // pulls random word from dictionary obj and adds it to words state
  addWord() {
    var availableWords = this.state.dictionary[this.state.round];
    var newWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    this.setState({
      words: [...this.state.words, newWord]
    });
  }

  // updates your view of opponent's words
  updateOpponentWordList(words) {
    this.setState({
      theirWords: words
    })
  }

  // updates userInput with what user is currently typing
  handleChange(e) {
    this.setState({
      userInput: e.target.value,
    })
  }

  // when the user hits "enter"
  handleSubmit(e) {
    e.preventDefault();
    var submittedWord = this.state.userInput;
    var index = this.state.words.indexOf(submittedWord);
    
    // check if what they typed is in our "words" array
    // flash green for a correctly typed word and remove word from "words" array
    if (index !== -1) {
      document.getElementById('typing-input').style.backgroundColor = "green";
      var newWords = this.state.words.slice();
      newWords.splice(index, 1);
      playCorrect(); 
      this.setState({
        words: newWords,
      });
    } else {
      // else flash red for a mistyped word
      playWrong(); 
      document.getElementById('typing-input').style.backgroundColor = "red";
    }

    setTimeout(() => {
      document.getElementById('typing-input').style.backgroundColor = "white";
    }, 100);

    this.setState({
      userInput: '',
    });
  }

  // upon game over, sends username and score to database to be added/updated
  sendScore(username, score) {
    axios.post('/wordgame', {
      "username": username,
      "high_score": score
    })
    .then(result => {
      console.log(result);
    }).catch(err => {
      console.error(err);
    })
  }

  goToLobby() {
    this.setState({
      userInput: '',
      dictionary: {},
      words: [],
      theirWords: [],
      time: 0,
      timeInterval: 1000,
      round: 'all',
      instructions: ["Humpty Dumpty sat on a wall,", "Humpty Dumpty had a great fall.", "All the king's horses and all the king's men", "Couldn't put Humpty together again.", "HURRY - KEEP TYPING TO PREVENT HIS DEMISE!"],
      prompt: 'START GAME',
      opponentTime: 0,
      userNameSelected: false,
      gameover: false,
      p1Name: undefined,
      p2Name: undefined,
      p1Score: 0,
      p2Score: 0,
    })
    document.getElementById('their-game').style.backgroundColor = "";
    document.getElementById('our-game').style.backgroundColor = "";
    this.props.history.push('/lobby');
    this.props.setRoomToLobby();
  }

  stopGame() {

    this.setState({
      instructions: ['GAME OVER', `YOU SCORED: ${this.state.time}`, `YOUR OPPONENT SCORED: ${this.state.opponentTime}`],
      prompt: 'Back to lobby',
      gameover: true
    });

    document.getElementById('typing-input').disabled = true;
    document.getElementById('overlay').style.display = "block";
    document.getElementById('gudetama').style.display = "none";
    document.getElementById('their-gudetama').style.display = "none";
    document.getElementById('starter-form').disabled = false;
    document.getElementById('user-input').disabled = false;

    // enables user to hit "enter" after 2 seconds to restart game
    setTimeout(() => {
      if (document.getElementById('overlay').display !== "none") {
        document.getElementById('user-input').focus();
      }
    }, 2000);
    
    this.sendScore(this.props.username, this.state.time);
 
    // audio effect
    playGameOver();
  }

  render() {
    return (
      <div className="game">
        {/* <div id="overlay">
          <div>{this.state.instructions.map((line, index) => {
            // audio effect:
            playStart();
            return (<span key={index}>{line}<br></br></span>)
          })}</div>
          <div id="crackedegg"></div>
          
          <div id="overlay-start" onClick={this.state.gameover ? this.goToLobby : this.getReady } className="blinking">{this.state.prompt}</div>
        </div> */}
    
        <div className="board">
          {/* your game: */}
          <div className="play" id="our-game">
            <div className="timer"><h1>{this.state.p1Score}</h1></div>
            {this.state.words.map((word, index) => {
              return <Brick word={word} key={index} />
            })}
            <div id="gudetama"></div>
            <form onSubmit={this.handleSubmit} autoComplete="off">
            <input value={this.state.p1Name} />
            </form>
          </div>

          {/* their game: */}
          <div className="play" id="their-game"> 
            <div className="timer"><h1>{this.state.p2Score}</h1></div>
            {this.state.theirWords.map((word, index) => {
              return <Brick word = { word } key = { index } />
            })}
            <div id="their-gudetama"></div>
            <form autoComplete="off">
              <input value={this.state.p2Name} />
            </form>
          </div>
        </div>
        <div><button className='back-to-lobby-btn' onClick={()=> this.goToLobby()}>Back to Lobby</button></div>
      </div>
    )
  }
}

export default Spectator;