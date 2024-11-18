const config = require('./config');

const MAP_WIDTH = config.MAP_WIDTH;
const MAP_HEIGHT = config.MAP_HEIGHT;

const getRandomColor = () => {
  const lettersHexa = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += lettersHexa[Math.floor(Math.random() * 16)];
  }
  return color;
};

const checkBorderMapCollision = (player) => {
  const radius = player.size / 2;

  if (player.x - radius < 0) {
    player.x = radius;
  } else if (player.x + radius > MAP_WIDTH) {
    player.x = MAP_WIDTH - radius;
  }

  if (player.y - radius < 0) {
    player.y = radius;
  } else if (player.y + radius > MAP_HEIGHT) {
    player.y = MAP_HEIGHT - radius;
  }
};

module.exports = {
  getRandomColor,
  checkBorderMapCollision,
};