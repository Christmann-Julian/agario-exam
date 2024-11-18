import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3001");

function App() {
  const [players, setPlayers] = useState({});
  const [food, setFood] = useState([]);

  useEffect(() => {
    socket.on("currentPlayers", (players) => {
      setPlayers(players);
    });

    socket.on("currentFood", (food) => {
      setFood(food);
    });

    socket.on("newPlayer", (player) => {
      setPlayers((prevPlayers) => ({
        ...prevPlayers,
        [player.id]: player,
      }));
    });

    socket.on("playerDisconnected", (playerId) => {
      setPlayers((prevPlayers) => {
        const updatedPlayers = { ...prevPlayers };
        delete updatedPlayers[playerId];
        return updatedPlayers;
      });
    });

    socket.on("playerMoved", (player) => {
      setPlayers((prevPlayers) => ({
        ...prevPlayers,
        [player.id]: player,
      }));
    });

    socket.on("foodUpdate", (food) => {
      setFood(food);
    });

    const handleKeyDown = (event) => {
      const movementData = { x: 0, y: 0 };
      if (event.key === "ArrowUp") movementData.y = -5;
      if (event.key === "ArrowDown") movementData.y = 5;
      if (event.key === "ArrowLeft") movementData.x = -5;
      if (event.key === "ArrowRight") movementData.x = 5;
      socket.emit("playerMovement", movementData);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      socket.off("currentPlayers");
      socket.off("currentFood");
      socket.off("newPlayer");
      socket.off("playerDisconnected");
      socket.off("playerMoved");
      socket.off("foodUpdate");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="App">
      <div className="game-area">
        <div className="grid"></div>
        {food.map((foodItem, index) => (
          <div
            key={index}
            className="food"
            style={{
              left: foodItem.x,
              top: foodItem.y,
              width: foodItem.size,
              height: foodItem.size,
              backgroundColor: foodItem.color,
            }}
          ></div>
        ))}
        {Object.keys(players).map((playerId) => (
          <div
            key={playerId}
            className="player"
            style={{
              left: players[playerId].x,
              top: players[playerId].y,
              width: players[playerId].size,
              height: players[playerId].size,
              backgroundColor: players[playerId].color,
            }}
          >
            <div className="player-name">{players[playerId].name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
