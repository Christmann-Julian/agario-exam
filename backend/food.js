const { getRandomColor } = require('./utils');
const config = require('./config');

const MAP_WIDTH = config.MAP_WIDTH;
const MAP_HEIGHT = config.MAP_HEIGHT;
const FOOD_COUNT = config.FOOD_COUNT;
const FOOD_SIZE = config.FOOD_SIZE;

const generateFood = () => {
  let food = [];
  for (let i = 0; i < FOOD_COUNT; i++) {
    food.push({
      x: Math.random() * (MAP_WIDTH - FOOD_SIZE),
      y: Math.random() * (MAP_HEIGHT - FOOD_SIZE),
      size: FOOD_SIZE,
      color: getRandomColor(),
    });
  }
  return food;
};

const isFoodCollision = (player, foodItem) => {
  const distX = player.x - foodItem.x;
  const distY = player.y - foodItem.y;
  const distance = Math.sqrt(distX * distX + distY * distY);

  return distance < player.size / 2 + foodItem.size / 2;
};

const checkFoodCollision = (player, food) => {
  return food.filter((foodItem) => {
    if (isFoodCollision(player, foodItem)) {
      player.size += 5;
      player.score += 5;
      return false;
    }
    return true;
  });
};

module.exports = {
  generateFood,
  isFoodCollision,
  checkFoodCollision,
};