DROP DATABASE IF EXISTS humptydumpty;

CREATE DATABASE humptydumpty;

USE humptydumpty;

CREATE TABLE users (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  high_score INTEGER,
  high_wpm INTEGER
);

CREATE TABLE messages (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  message VARCHAR(100),
  room VARCHAR(100)
);