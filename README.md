# Save Gudetama Typing Game

Welcome to the Save Gudetama typing game! The typing game for "adults."

In 'Save Gudetama' users type as fast as they can to save their Gudetama. If they type fast enough you can save your own Gudetama and watch as your opponent's gudetama gets crushed to eggy-goo by a pile of bricks! Challenge your friends, enjoy the 8-bit design and retro-themes /sounds. We really enjoyed building this project, your feedback is welcomed! 

![Alt Text](./output.gif)

In this project we built multiplayer functionality to enhance the gameplay of the 'Save Gudetama' typing game. Players are now able to authenticate with Facebook, create & enter game rooms to chat and play 'Save Gudetama' with their friends.

## Features
- Responsive web design with web and mobile views
- User Authentication via Facebook
- Real-time client to client communication
- Fun gameplay!
- Lobby, chat, matchmaking

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

1. Fork the github repo
2. In the root directory, run the following scripts in node
  - 'npm run react-dev'
  - 'npm run server-dev'
  - 'npm install'
3. Generate a local SSL certificate (we used this article! --> https://medium.freecodecamp.org/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec)
4. Setup a developer account on Facebook to facillitate oauth.
5. Create an oauth application in the Facebook developer console.
6. Navigate to https://localhost:5000/ on your browser to test and enjoy!

### Prerequisites

What things you need to install the software and how to install them

```
Node (>9.8.0)
Web-browser (Chrome preferred, limited testing on alternative browsers)

```

### Installing

A step by step series of examples that tell you how to get a development env running

Install the required dependencies.

```
npm install
```

Run the server using the provided script

```
npm run server-dev
```

Run the server using the provided script

```
npm run react-dev
```

Create a .env file with the following information --> NOTE: the file should literally be titled '.env'

The information in this file with facillitate configuration for authentication with facebook as well as connecting to the DB instance!

```
APP_ID = 'insert your data'
APP_SECRET = 'insert your data'
DB_LOCATION = 'insert your data'
DB_USERNAME = 'insert your data'
DB_PASS = 'insert your data'
CALLBACK_URL = 'insert your data'
```

## Deployment

We used heroku to deploy this code! 

In order to deploy your own version, you need to:
1. Set up an SQL database - we used AWS RDS to persist our data
2. Set up a Facebook oauth application
3. Configure the .env file
4. Install Heroku terminal utilities

## Built With

* [React](https://reactjs.org/) - Used to render the client application
* [React Spring](https://github.com/drcmda/react-spring) - Used to animate certain functionality
* [React Router](https://www.npmjs.com/package/react-router) - Used to generate distinct views at virtual endpoints
* [Express](https://expressjs.com/) - Framework leveraged to create and run server
* [Passport JS](http://www.passportjs.org/) - Authentication framework
* [Passport Facebook](http://www.passportjs.org/docs/facebook/) - Configuration framework used with passport to authenticate with Facebook.
* [Sockets.io](http://sockets.io/) - Used to facillitate realtime communication between client and server.
* [Axios](http://axios.io/) - Used to facillitate HTTP requests from client to server and vice-versa.
* [Emojis-mart](https://github.com/missive/emoji-mart) - Framework used to get emoji data reliably.
* [React Emoji Picker](https://www.npmjs.com/package/emoji-picker-react) - Slick emoji selector component integrated into chat.
* [MySQL](https://www.npmjs.com/package/mysql) - Used to configure and query SQL database.

## Authors

* **John Cynn** - *Lobby, chat, matchmaking, authentication, gameplay enhancements* - [jcynn12](https://github.com/jcynn12)
* **Philip Gonzalez** - *Lobby, chat, matchmaking, authentication, gameplay enhancements* - [p-gonzo](https://github.com/p-gonzo)
* **Nick Rogers** - *Lobby, chat, matchmaking, authentication, gameplay enhancements* - [rogersanick](https://github.com/rogersanick)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Team Iron Man for letting us build on top of their wonderful gameplay! https://github.com/IronMan-HR/IronMan-HR

* **Scott McCreary** - *Original game functionality* - [scottmccreary](https://github.com/scottmccreary)
* **Lina Lei** - *Original game functionality* - [lina-lei](https://github.com/lina-lei)
* **Koichi Sakamaki** - *Original game functionality* - [jcynn12](https://github.com/Drive2blue)
