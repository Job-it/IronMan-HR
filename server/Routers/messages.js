var express = require('express');
var {saveMessage, getMessages} = require('../../database/index.js');

var messageRouter = express.Router();

messageRouter.get('/', (req,res) => {
  getMessages(req.query).then((results) => {
    res.send(results);
  })
});

messageRouter.post('/', (req,res) => {
  saveMessage(req.body).then((results) => {
    res.status(200).send(results);
  }).catch((err) => {
    console.log(err);
    res.status(400).send();
  });
});

module.exports = messageRouter;