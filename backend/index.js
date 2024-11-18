const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

const MAP_WIDTH = 1400;
const MAP_HEIGHT = 800;
const FOOD_COUNT = 60;
const FOOD_SIZE = 10;
const PLAYER_SIZE = 20;

let players = {};
let food = [];
let playerCount = 1;

app.use(cors());

const getRandomColor = () => {
    const lettersHexa = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += lettersHexa[Math.floor(Math.random() * 16)];
    }
    return color;
};

const generateFood = () => {
  food = [];
  for (let i = 0; i < FOOD_COUNT; i++) {
    food.push({
      x: Math.random() * (MAP_WIDTH - FOOD_SIZE),
      y: Math.random() * (MAP_HEIGHT - FOOD_SIZE),
      size: FOOD_SIZE,
      color: getRandomColor(),
    });
  }
};

const checkCollision = (player, foodItem) => {
  const distX = player.x + player.size / 2 - (foodItem.x + foodItem.size / 2);
  const distY = player.y + player.size / 2 - (foodItem.y + foodItem.size / 2);
  const distance = Math.sqrt(distX * distX + distY * distY);

  return distance < player.size / 2 + foodItem.size / 2;
};

generateFood();

io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);

  players[socket.id] = {
    x: Math.floor(Math.random() * MAP_WIDTH),
    y: Math.floor(Math.random() * MAP_HEIGHT),
    size: PLAYER_SIZE,
    color: getRandomColor(),
    name: `Player ${playerCount++}`,
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

  socket.on('playerMovement', (movementData) => {
    let player = players[socket.id];
    player.x = Math.max(0, Math.min(MAP_WIDTH - player.size, player.x + movementData.x));
    player.y = Math.max(0, Math.min(MAP_HEIGHT - player.size, player.y + movementData.y));

    food = food.filter((foodItem) => {
      if (checkCollision(player, foodItem)) {
        player.size += 5;
        return false;
      }
      return true;
    });

    if (food.length === 0) {
      generateFood();
    }

    io.emit('playerMoved', { id: socket.id, ...player });
    io.emit('foodUpdate', food);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});