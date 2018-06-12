import React from 'react';
import ReactDOM from 'react-dom';
import { Route, withRouter } from 'react-router-dom';
import Game from './components/Game.jsx';
import Scoreboard from './components/Scoreboard.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      room: 'scottVsLina',
      username: '',
    }
    this.handleUserNameChange = this.handleUserNameChange.bind(this);   
  }

  handleUserNameChange(e) {
    this.setState({
      username: e.target.value,
    });
  }

  render() {
    return (
      <div className="app-container">
        <Route path = '/' render = {
          (props) => {
            return (<div>
              <nav>
                <h1>SAVE GUDETAMA!</h1>
              </nav>  
              <div className="game-container">
                <Game {...props} room={this.state.room} username={this.state.username} handleUserNameChange={this.handleUserNameChange}/>
                <Scoreboard {...props} />
              </div>
            </div>);
          }
        }/>
      </div>
    )
  }
}

export default App;