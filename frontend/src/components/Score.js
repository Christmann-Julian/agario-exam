import React from 'react'

const Score = ({players}) => {
    const sortedPlayers = Object.keys(players).map((playerId) => players[playerId]).sort((a, b) => b.score - a.score);

    return (
        <div className="score-board">
          {sortedPlayers.map((player) => (
            <div key={player.id} className="score-item">
              {player.name} : {player.score} points
            </div>
          ))}
        </div>
      );
}

export default Score