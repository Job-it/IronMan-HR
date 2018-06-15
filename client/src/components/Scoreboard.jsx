import React from 'react';
import axios from 'axios';

class Scoreboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      highscore: [], 
      rank: ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH'],
      counter: 0
    } 
    this.updateScoreboard = this.updateScoreboard.bind(this);
  }
 
  componentDidMount() {
    this.updateScoreboard(); 
  }

  updateScoreboard() {
  	axios.get("/wordgame")
  	.then((results) => {
  		this.setState({
  			highscore: results.data
  		});
    });
  }

  render() {
  	return (
      <div className="scoreboard">
        <h3 className="sbHeader">HIGH SCORES</h3>
        <ul className="sbColumn left">RANK</ul>
        <ul className="sbColumn middle">NAME</ul>
        <ul className="sbColumn right">SCORE</ul>
        {this.state.highscore.map((score, index) => 
          <div key={index}>  
            <ul className="sbColumn left">{this.state.rank[this.state.counter++]}</ul>
            <ul className="sbColumn middle">{score.username}</ul>
            <ul className="sbColumn right">{score.high_score}</ul>
          </div>
        )} 
      </div>
  	) 
  }
} 

export default Scoreboard;