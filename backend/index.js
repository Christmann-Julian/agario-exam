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
const PLAYER_SPEED = 0.8;

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
    players[socket.id].targetX = mouseData.x;
    players[socket.id].targetY = mouseData.y;
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

        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x + player.size > MAP_WIDTH) player.x = MAP_WIDTH - player.size;
        if (player.y + player.size > MAP_HEIGHT) player.y = MAP_HEIGHT - player.size;

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

        io.emit('playerMoved', { id, ...player });
        io.emit('foodUpdate', food);
      }
    }
  }, 1000 / 60);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});