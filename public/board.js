// board.js

function createBoard(wordLength, boardElement) {
    boardElement.innerHTML = "";
    boardElement.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;
    const maxTiles = 6 * wordLength; // Allow 6 guesses
    let currentRowEnd = wordLength; // Set the first row end
  
    for (let i = 0; i < maxTiles; i++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      boardElement.appendChild(tile);
    }
  
    return { maxTiles, currentRowEnd };
  }
  
  module.exports = createBoard;
  