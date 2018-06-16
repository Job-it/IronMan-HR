import React from 'react';
import Brick from './Brick.jsx';
import axios from 'axios';
import Speed from './Speed.jsx';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInput: '',
      dictionary: {},
      words: [],
      correctWords: 0,
      theirWords: [],
      time: 0,
      timeInterval: 1000,
      round: 'all',
      instructions: ["HURRY - KEEP TYPING TO PREVENT HIS DEMISE!"],
      prompt: 'START GAME',
      opponentTime: 0,
      userNameSelected: false,
      gameover: false,
      activePlayer: false,
      opponentScore: 0,
      opponentName: null,
      opponentLost: false,
      startTime: 0,
      stopTime: 0,
      wpm: 0,
      opponentAbandonedGame: false,
      opponentDataLastReceived: null,
      iLost: false,
    };
    
    this.goToLobby = this.goToLobby.bind(this);
    this.getReady = this.getReady.bind(this);
    this.startGame = this.startGame.bind(this);
    this.addWord = this.addWord.bind(this);
    this.updateOpponentWordList = this.updateOpponentWordList.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sendScore = this.sendScore.bind(this);
    this.stopGame = this.stopGame.bind(this);
    this.calculateWpm = this.calculateWpm.bind(this);


    this.props.socket.on('receive words from opponent', (data) => {
      if (this.state.activePlayer === false) {
        this.props.history.push('/spectator');
      }
      // this.updateOpponentWordList(data.newWords);
      this.setState({
        theirWords: data.newWords,
        opponentScore: data.score,
        opponentName: data.userName,
        opponentDataLastReceived: Date.now(),
      })

    });
    this.props.socket.on('startGame', () => {
      console.log('starting game...');
      if (this.state.activePlayer === false) {
        this.props.history.push('/spectator');
      } else {
        this.startGame();
      }
    });
    this.props.socket.on('they lost', (data) => {

      if (this.state.iLost) {
        document.getElementById('their-game').style.backgroundColor = "green";
      } else {
        document.getElementById('their-game').style.backgroundColor = "red";
        document.getElementById('their-gudetama').style.display = "none";
      }
      
      console.log(data);
      this.setState({
        opponentLost: true,
      })
      if (this.state.gameover === true) {
        this.showGameoverOverlay();
      }
    });
  }

  // get words from dictionary and join this.props.socket
  componentDidMount() {
    axios.get('/dictionary')
    .then(results => {
      this.setState({
        dictionary: results.data,
      })
    }).catch(err => {
      console.error(err);
    });
  }

  // sends your words to opponent
  componentDidUpdate(prevProps, prevState) {
    if (this.state.words.length !== prevState.words.length) {
      this.props.socket.emit('send words to opponent', {
        room: this.props.room,
        newWords: this.state.words,
        userName: this.props.username,
        score: this.state.time,
      }); 
    }
  }

  // leave this.props.socket
  componentWillUnmount() {  
    this.props.socket.emit('leaving room', {
      room: this.props.room,
      username: this.props.username,
    });
  }

  // submitUserName(e) {
  //   e.preventDefault();
  //   this.setState({
  //     userNameSelected: true
  //   })
  // }

  // hides starter form and user input, waits for another player to start game
  getReady(e) {
    e.preventDefault();
    // document.getElementById('starter-form').disabled = true;
    // document.getElementById('user-input').disabled = true;
    this.setState({
      prompt: 'WAITING...',
      activePlayer: true,
    }, () => {
      this.props.socket.emit('ready', {
        room: this.props.room, 
        username: this.props.username
      });
    });
  }

  startGame() {
    document.getElementById('typing-input').disabled = false;
    document.getElementById('typing-input').focus();
    document.getElementById('overlay').style.display = "none";
    document.getElementById('their-game').style.backgroundColor = "transparent";
    document.getElementById('gudetama').style = {
      display: "inline-block",
      backgroundColor: "none",
    };
    document.getElementById('their-gudetama').style = {
      display: "inline-block",
      backgroundColor: "none",
    };

    // long function to define what happens at every interval
    var go = () => {
      // creates a loop by calling itself:
      var step = setTimeout(() => {
        go();
      }, this.state.timeInterval);

      // adds a brick:
      this.addWord();

      // ends game or changes background color of gudetama based on length of "words" array
      // (as bricks build up, background turns a darker red to signify danger)
      if (this.state.words.length >= 20) {
        clearTimeout(step);
        this.setState({
          iLost: true
        });
        //console.log('opponent time',this.state.time)
        this.props.socket.emit('i lost', {
          room: this.props.room, 
          username: this.props.username, 
          score: this.state.time
        });
        if (!this.state.opponentLost) {
          document.getElementById('our-game').style.backgroundColor = "red";
          document.getElementById('gudetama').style.display = "none";
        }
        this.stopGame();
      } else if (this.state.words.length > 15) {
        if (!this.state.opponentLost && !this.state.iLost) {
          document.getElementById('gudetama').style.backgroundColor = "rgba(255, 0, 0, 1)";
        }
      } else if (this.state.words.length > 10) {
        if (!this.state.opponentLost && !this.state.iLost) {
          document.getElementById('gudetama').style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        }
      }

      // updates the time and speeds up the game accordingly 
      // (as timeInterval decreases, words appear at a faster rate)
      var newTime = this.state.time + 1;
      if (newTime > 20) {
        this.setState({
          time: newTime,
          // timeInterval: 600,
          //round: 'roundThree', // uncomment these to only serve short words at beginning, long words at end
        });
      } else if (newTime > 8) { 
        this.setState({
          time: newTime,
          // timeInterval: 800,
          //round: 'roundTwo',
        });
      } else {
        this.setState({
          time: newTime,
          //round: 'roundOne',
        });
      }

      //if the opponent hasn't emitted a word in 4 seconds or more
      //end the game, because the opponent left.
      if (Date.now() - this.state.opponentDataLastReceived > 4000 && this.state.opponentLost === false) {
        console.log(Date.now() - this.state.opponentDataLastReceived);
        document.getElementById('their-game').style.backgroundColor = "red";
        document.getElementById('their-gudetama').style.display = "none";
        //TO DO
        this.setState({
          opponentLost: true,
          opponentAbandonedGame: true,
        });
      } 

    }

    // blank slate, then start!
    this.setState({
      words: [],
      time: 0,
      timeInterval: 1000,
      userInput: '',
      startTime: Date.now(),
      stopTime: 0,
      correctWords: 0,
      wpm: 0,
      opponentDataLastReceived: Date.now(),
    }, () => go());
  
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
      theirWords: words,
    })
  }

  // updates userInput with what user is currently typing
  handleChange(e) {
    this.setState({
      userInput: e.target.value,
    });
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
      if (this.props.soundOn) {
        playCorrect();
      }
      this.setState({
        words: newWords,
        correctWords: this.state.correctWords + 1,
      });
    } else {
      // else flash red for a mistyped word
      if (this.props.soundOn) {
        playWrong();
      }
      document.getElementById('typing-input').style.backgroundColor = "red";
    }

    setTimeout(() => {
      document.getElementById('typing-input').style.backgroundColor = "white";
    }, 100);

    this.setState({
      userInput: ''
    });

    this.calculateWpm();
  }

  calculateWpm() {
    this.setState({
      stopTime: Date.now()
    }, () => {
      if (this.state.startTime !== 0) {
        var minutes = ((this.state.stopTime - this.state.startTime) / 1000) / 60;
        this.setState({
          wpm: Math.round(this.state.correctWords / minutes)
        });
      }
    });
  }

  // upon game over, sends username and score to database to be added/updated
  sendScore(username, score, wpm) {
    console.log('sending score');
    axios.post('/wordgame', {
      "username": username,
      "high_score": score,
      "high_wpm": wpm
    })
    .then(result => {
      console.log(result);
    }).catch(err => {
      console.error(err);
    });
  }

  goToLobby() {
    this.setState({
      userInput: '',
      dictionary: {},
      words: [],
      correctWords: 0,
      theirWords: [],
      time: 0,
      timeInterval: 1000,
      round: 'all',
      instructions: ["HURRY - KEEP TYPING TO PREVENT HIS DEMISE!"],
      prompt: 'START GAME',
      opponentTime: 0,
      userNameSelected: false,
      gameover: false,
      activePlayer: false,
      opponentScore: 0,
      opponentName: null,
      opponentLost: false,
      startTime: 0,
      stopTime: 0,
      wpm: 0,
      opponentAbandonedGame: false,
      opponentDataLastReceived: null,
      iLost: false,
    });
    document.getElementById('their-game').style.backgroundColor = "";
    document.getElementById('our-game').style.backgroundColor = "";
    this.props.history.push('/lobby');
    this.props.setRoomToLobby();
  }

  showGameoverOverlay() {

    if (this.state.opponentAbandonedGame === true) {
      var overlayMessage = 'YOU WIN: OPPONENT FORFEIT!';
    } else {
      var overlayMessage = `GAME OVER ${this.state.time > this.state.opponentScore ? 'YOU WIN' : 'YOU LOSE'}`;
    }

    this.setState({
      instructions: [],
      prompt: '',
      message: overlayMessage,
    });

    setTimeout(() => {
      this.setState({
        instructions: [`GAME OVER ${this.state.time > this.state.opponentScore ? 'YOU WIN' : 'YOU LOSE'}`, `YOU SCORED: ${this.state.time}`, `${this.state.opponentName} SCORED: ${this.state.opponentScore}`],
        prompt: 'Back to lobby',
        message: false
      });
    }, 4000);

    document.getElementById('overlay').style.display = "block";
  }

  stopGame() {
    this.setState({
      gameover: true,
    });

    this.calculateWpm();

    if(this.state.opponentLost === true) {
      this.showGameoverOverlay();
    }

    document.getElementById('typing-input').disabled = true;
    // document.getElementById('starter-form').disabled = false;
    // document.getElementById('user-input').disabled = false;

    // enables user to hit "enter" after 2 seconds to restart game
    setTimeout(() => {
      if (document.getElementById('overlay').display !== "none") {
        // document.getElementById('user-input').focus();
      }
    }, 2000);
    
    this.sendScore(this.props.username, this.state.time, this.state.wpm);

    // audio effect
    if (this.props.soundOn) {
      playGameOver();
    }
  }

  render() {
    return (
      <div className="game">
        <Speed wpm={this.state.wpm}/>
        <div id="overlay">
          <div>{this.state.instructions.map((line, index) => {
            // audio effect:
            if (this.props.soundOn) {
              playStart();
            } else {
              stopStart();
            }
            return (<span key={index}>{line}<br></br></span>)
          })}</div>
          <div id="crackedegg"></div>
          {/* <div>
            "getReady" waits for 2 players, "startGame" (on click) is 1 player
            <form id="starter-form" onSubmit={(e) => {this.submitUserName(e)}} autoComplete="off">
              {this.userNameSelected ? <div></div> : <input id="user-input" placeholder="Who are you?" onChange={this.props.handleUserNameChange} autoFocus/>}
              <button type = "submit"> Select Username </button>
            </form>
          </div> */}
          <div id="overlay-start" onClick={this.state.gameover ? this.goToLobby : this.getReady } className="blinking">{this.state.message ? this.state.message : ''}{this.state.prompt}</div>
        </div>

        <div className="board">
          {/* your game: */}
          <div className="play" id="our-game"> 
            <div className="timer"><h1>{this.state.time}</h1></div>
            {this.state.words.map((word, index) => {
              return <Brick word={word} key={index} />
            })}
            <div id="gudetama"></div>
            <form onSubmit={this.handleSubmit} autoComplete="off">
              <input id="typing-input" value={this.state.userInput} onChange={this.handleChange} />
            </form>
          </div>

          {/* their game: */}
          <div className="play" id="their-game"> 
            <div className="timer"><h1>{this.state.opponentScore}</h1></div>
            {this.state.theirWords.map((word, index) => {
              return <Brick word = { word } key = { index } />
            })}
            <div id="their-gudetama"></div>
            <form autoComplete="off">
              <input value={this.state.opponentName} />
            </form>
          </div>
        </div>
        <div><button className='back-to-lobby-btn' onClick={()=> this.goToLobby()}>Back to Lobby</button></div>
      </div>
    )
  }
}

export default Game;