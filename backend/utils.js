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
  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
  if (player.x + player.size > MAP_WIDTH) player.x = MAP_WIDTH - player.size;
  if (player.y + player.size > MAP_HEIGHT) player.y = MAP_HEIGHT - player.size;
};

module.exports = {
  getRandomColor,
  checkBorderMapCollision,
};