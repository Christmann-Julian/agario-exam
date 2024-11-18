const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const config = require('./config');
const { generateFood, checkFoodCollision } = require('./food');
const { getRandomColor, checkBorderMapCollision } = require('./utils');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = config.PORT;

const MAP_WIDTH = config.MAP_WIDTH;
const MAP_HEIGHT = config.MAP_HEIGHT;
const PLAYER_SIZE = config.PLAYER_SIZE;
const PLAYER_SPEED = config.PLAYER_SPEED;

let players = {};
let food = [];
let playerCount = 1;

app.use(cors());

const checkPlayerCollision = (players) => {
  const playerIds = Object.keys(players);
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      const player1 = players[playerIds[i]];
      const player2 = players[playerIds[j]];

      const dx = player1.x - player2.x;
      const dy = player1.y - player2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < (player1.size + player2.size) / 2) {
        if (player1.size > player2.size) {
          player1.size += player2.size / 2;
          delete players[playerIds[j]];
          io.emit('playerDisconnected', playerIds[j]);
        } else if (player2.size > player1.size) {
          player2.size += player1.size / 2;
          delete players[playerIds[i]];
          io.emit('playerDisconnected', playerIds[i]);
        }
      }
    }
  }
}

food = generateFood();

io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);

  players[socket.id] = {
    x: Math.floor(Math.random() * MAP_WIDTH),
    y: Math.floor(Math.random() * MAP_HEIGHT),
    size: PLAYER_SIZE,
    color: getRandomColor(),
    name: `Player ${playerCount++}`,
    targetX: null,
    targetY: null,
  };

  socket.emit('currentPlayers', players);
  socket.emit('currentFood', food);
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    playerCount--;
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });

  socket.on('mouseMovement', (mouseData) => {
    if (players[socket.id]) {
      players[socket.id].targetX = mouseData.x;
      players[socket.id].targetY = mouseData.y;
    }
  });

  setInterval(() => {
    for (let id in players) {
      let player = players[id];
      if (player.targetX !== null && player.targetY !== null) {
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > PLAYER_SPEED) {
          player.x += (dx / distance) * PLAYER_SPEED;
          player.y += (dy / distance) * PLAYER_SPEED;
        } else {
          player.x = player.targetX;
          player.y = player.targetY;
        }

        checkBorderMapCollision(player);
        food = checkFoodCollision(player, food);

        if (food.length === 0) {
          food = generateFood();
        }

        io.emit('playerMoved', { id, ...player });
        io.emit('foodUpdate', food);
      }
    }
    checkPlayerCollision(players);
  }, 1000 / 60);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});