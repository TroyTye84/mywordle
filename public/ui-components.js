function updateBackgroundColor() {
  const now = new Date();
  const hour = now.getHours(); // Get the current hour (0-23)

  let backgroundColor;

  if (hour >= 6 && hour < 12) {
    backgroundColor = "#f1f2f3"; // Morning: Light yellow
  } else if (hour >= 12 && hour < 14) {
    backgroundColor = "#f1f2f3"; // Afternoon: Light blue
  } else if (hour >= 15 && hour < 21) {
    backgroundColor = "#f1f2f3"; // Evening: Golden yellow
  } else {
    backgroundColor = "#2C3E50"; // Night: Dark blue-gray
  }

  document.body.style.backgroundColor = backgroundColor;
}

// Call the function initially
updateBackgroundColor();

// Optional: Update the background color every hour
setInterval(updateBackgroundColor, 3600000); // 3600000ms = 1 hour


function createVirtualKeyboard() {
    const keyboardContainer = document.getElementById("virtual-keyboard");
    const keys = [
      "qwertyuiop", // Top row
      "asdfghjkl",  // Middle row
      "zxcvbnm",    // Bottom row (we will modify this)
    ];
  
    keys.forEach((row, rowIndex) => {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("keyboard-row");
  
      // Split the row into keys
      row.split("").forEach((key) => {
        const button = document.createElement("button");
        button.textContent = key.toUpperCase(); // Uppercase letters for display
        button.id = `key-${key}`;
        button.addEventListener("click", () => handleKeyboardInput(key));
        rowDiv.appendChild(button);
      });
  
      // Add the DELETE button next to the "m" on the bottom row
      if (rowIndex === 2) { // Check if it's the last row
        const deleteButton = document.createElement("button");
        deleteButton.id = "delete-button"; // Use the updated CSS rule
        deleteButton.innerHTML = "&#x232B;"; // Unicode for backspace icon
        deleteButton.addEventListener("click", handleBackspace);
        rowDiv.appendChild(deleteButton); // Add it to the same row
      }
  
      keyboardContainer.appendChild(rowDiv);
    });
  }
  
  // Handle virtual keyboard input
  function handleKeyboardInput(key) {
    const tiles = Array.from(board.children);
  
    // Check if within the current row and bounds
    if (currentTileIndex < currentRowEnd) {
      const tile = tiles[currentTileIndex];
      if (!tile.textContent) { // Only add text to empty tiles
        tile.textContent = key.toUpperCase(); // Add the key to the tile
        currentTileIndex++; // Move to the next tile
      }
    }
  }
  
  // Handle backspace input
  function handleBackspace() {
    console.log("DELETE"); // Log "DELETE" when the function is called
    const tiles = Array.from(board.children);
    if (currentTileIndex > currentRowStart) {
      currentTileIndex--; // Move to the previous tile
      const tile = tiles[currentTileIndex];
      tile.textContent = ""; // Clear the tile content
    }
  }
  
  // Handle guess submission
  function handleSubmit() {
    const tiles = Array.from(board.children);
    const guess = tiles
      .slice(currentRowStart, currentRowEnd) // Get tiles in the current row
      .map((tile) => tile.textContent)
      .join("")
      .toLowerCase();
  
      // Check if the guess has the correct length
  if (guess.length !== wordLength) {
    showFeedbackMessage(`Please complete the row with ${wordLength} letters before submitting.`);
    return;
  }
    checkGuess(guess);
  
    // Move to the next row
    if (guess.length === wordLength) {
      if (currentRowEnd < maxTiles) {
        currentRowStart = currentRowEnd; // Start of the next row
        currentRowEnd = currentRowStart + wordLength; // End of the next row
      }
    }
  }
  
  // Create the game board dynamically
  function createBoard(wordLength) {
    board.innerHTML = "";
    const tileSize = Math.min(60, Math.floor(window.innerWidth / wordLength)) - 10; // Adjust size based on screen width
    board.style.gridTemplateColumns = `repeat(${wordLength}, minmax(${tileSize}px, 1fr))`; // Dynamically set column width
    maxTiles = 6 * wordLength; // Allow 6 guesses
    currentRowEnd = wordLength; // Set the first row end
  
    for (let i = 0; i < maxTiles; i++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.style.width = `${tileSize}px`; // Apply calculated size
      tile.style.height = `${tileSize}px`; // Make tiles square
      board.appendChild(tile);
    }
  }
 
  function printElementLocations() {
    const titleContainer = document.getElementById("title-container");
    const virtualKeyboardContainer = document.getElementById("virtual-keyboard-container");
  
    if (titleContainer && virtualKeyboardContainer) {
      const titleContainerRect = titleContainer.getBoundingClientRect();
      const virtualKeyboardContainerRect = virtualKeyboardContainer.getBoundingClientRect();
  
      console.log(`Bottom of Title Container: ${titleContainerRect.bottom}px`);
      console.log(`Top of Virtual Keyboard Container: ${virtualKeyboardContainerRect.top}px`);
    } else {
      console.error("Ensure that both #title-container and #virtual-keyboard-container exist in the DOM.");
    }
  }
  
  // Call this function after the DOM has fully loaded
  document.addEventListener("DOMContentLoaded", printElementLocations);
  function adjustBoardSizeProportionally() {
    const titleContainer = document.getElementById("title-container");
    const virtualKeyboardContainer = document.getElementById("virtual-keyboard-container");
    const board = document.getElementById("board");
  
    if (titleContainer && virtualKeyboardContainer && board) {
      // Get the bounding rectangles
      const titleContainerRect = titleContainer.getBoundingClientRect();
      const virtualKeyboardContainerRect = virtualKeyboardContainer.getBoundingClientRect();
  
      // Calculate the available height and width
      const availableHeight = virtualKeyboardContainerRect.top - titleContainerRect.bottom;
      const availableWidth = window.innerWidth;
  
      // Calculate proportional tile size based on the smaller dimension
      const numRows = 6; // Fixed number of rows
      const numCols = parseInt(board.style.gridTemplateColumns.split(' ').length || 5); // Number of columns
  
       
    }
  
  }
  // Adjust the board size after the DOM has loaded and on window resize
  document.addEventListener("DOMContentLoaded", adjustBoardSize);
  window.addEventListener("resize", adjustBoardSize);
  