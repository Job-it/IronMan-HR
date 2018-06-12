import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import Game from './components/Game.jsx';
import Scoreboard from './components/Scoreboard.jsx';
import Login from './components/Login.jsx';
import axios from 'axios'

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

  componentDidMount() {
    axios.get('/users')
      .then((response) => {
        if (response.headers.user) {
          var user = JSON.parse(response.headers.user);
        } else {
          var user = undefined;
        }
        if (user === undefined) {
          this.props.history.push('/login');
        } else {
          this.props.history.push('/game');
        }
      })
  }

  logout() {
    axios.get('/logout').then(() => {
      this.props.history.push('/login');
    })
  }

  render() {
    return (
      <div className="app-container">
        <Route path = '/game' render = {
          (props) => {
            return (<div>
              <nav>
                <h1>SAVE GUDETAMA!</h1>
                <button onClick = {() => {this.logout()}} >Logout</button>
              </nav>  
              <div className="game-container">
                <Game {...props} room={this.state.room} username={this.state.username} handleUserNameChange={this.handleUserNameChange}/>
                <Scoreboard {...props} />
              </div>
            </div>);
          }
        }/>
        <Route path = '/login' render = {
          (props) => {
            return (
              <div>
                <Login />
              </div>
            );
          }
        }/>
      </div>
    )
  }
}

export default withRouter(App);

// make a mvp login route (client);
// One component, one html tag, one link --> /auth/facebook
// on component did mount - send get to server 
// parse response for user data in header
// deal with the request on the server
// conditionally route user