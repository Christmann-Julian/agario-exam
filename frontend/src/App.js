import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3001");

function App() {
  const [players, setPlayers] = useState({});
  const [food, setFood] = useState([]);
  const [isPlayerActive, setIsPlayerActive] = useState(true);
  const gameAreaRef = useRef(null);

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
      if (playerId === socket.id) {
        setIsPlayerActive(false);
      }
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

    const handleMouseMove = (event) => {
      if (gameAreaRef.current && isPlayerActive) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        socket.emit("mouseMovement", { x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      socket.off("currentPlayers");
      socket.off("currentFood");
      socket.off("newPlayer");
      socket.off("playerDisconnected");
      socket.off("playerMoved");
      socket.off("foodUpdate");
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isPlayerActive]);

  const handleRestart = () => {
    setIsPlayerActive(true);
    socket.emit("restartPlayer");
  };

  return (
    <div className="App">
      <div className="game-area" ref={gameAreaRef}>
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
              left: players[playerId].x - players[playerId].size / 2,
              top: players[playerId].y - players[playerId].size / 2,
              width: players[playerId].size,
              height: players[playerId].size,
              backgroundColor: players[playerId].color,
            }}
          >
            <div className="player-name">{players[playerId].name}</div>
          </div>
        ))}
      </div>
      {!isPlayerActive && (
        <button className="restart-button" onClick={handleRestart}>
          Restart
        </button>
      )}
    </div>
  );
}

export default App;