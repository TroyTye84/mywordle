function printCenterBetweenElements() {
  const titleContainer = document.getElementById("title-container");
  const virtualKeyboardContainer = document.getElementById("virtual-keyboard-container");

  if (titleContainer && virtualKeyboardContainer) {
    const titleContainerRect = titleContainer.getBoundingClientRect();
    const virtualKeyboardContainerRect = virtualKeyboardContainer.getBoundingClientRect();

    const titleBottom = titleContainerRect.bottom;
    const keyboardTop = virtualKeyboardContainerRect.top;

    const centerPixel = (titleBottom + keyboardTop) / 2;

    // Print the values to the console
    console.log(`Bottom of Title Container: ${titleBottom}px`);
    console.log(`Top of Virtual Keyboard Container: ${keyboardTop}px`);
    console.log(`Center Pixel: ${centerPixel}px`);
  } else {
    console.error("Ensure that both #title-container and #virtual-keyboard-container exist in the DOM.");
  }
}

// Call this function after the DOM has fully loaded
document.addEventListener("DOMContentLoaded", printCenterBetweenElements);

function updateBackgroundColor() {
  const now = new Date();
  const hour = now.getHours(); // Get the current hour (0-23)

  let backgroundColor;
  let tileColor; // Tile background color
  let tileBorderColor; // Tile border color
  let buttonColor; // Virtual keyboard button color
  let buttonTextColor; // Button text color
  let buttonBorderColor; // Button border color
  let timeIconColor; // Time icon color
  let timerColor; // Timer color
  let pointsIconColor; // Points icon color
  let wordleLogoColor; // Wordle logo color
  let themeColor; // Theme color for the meta tag
  let tileTextColor; // Tile text color


  if (hour >= 1 && hour < 24) {
    backgroundColor = "#f1f2f3"; // Morning: Light yellow
    tileColor = "#ffffff"; // Light white for tile
    tileBorderColor = "#efefef"; // Light gray for tile border
    tileTextColor = "#000000"; // Dark text for contrast
    buttonColor = "#ffffff"; // White button
    buttonTextColor = "black"; // Dark gray text
    buttonBorderColor = "#efefef"; // Light gray button border
    timeIconColor = "#4a4f54"; // Red for the time icon
    timerColor = "#4a4f54"; // Dark gray for visibility
    pointsIconColor = "#4a4f54"; // Dark gray for visibility
    wordleLogoColor = "#4a4f54";
    themeColor = "#f1f2f3"; // Light yellow theme
  } else {
    backgroundColor = "#17171c"; // Night: Dark blue-gray
    tileColor = "#2e2f38"; // Dark gray for tile
    tileBorderColor = "#2e2f38"; // Dark gray for tile border
    tileTextColor = "#ffffff"; // White text for visibility
    buttonColor = "#2e2f38"; // Dark gray button
    buttonTextColor = "#f1f2f3"; // Light gray text
    buttonBorderColor = "#2e2f38"; // Dark gray button border
    timeIconColor = "#f1f2f3"; // Light gray for contrast
    timerColor = "#f1f2f3"; // Light gray for visibility
    pointsIconColor = "#f1f2f3"; // Light gray for visibility
    wordleLogoColor = "#f1f2f3";
    themeColor = "#17171c"; // Dark blue-gray theme
  }
  // Update background color
  document.body.style.backgroundColor = backgroundColor;

  // Update the theme-color meta tag
  const themeMetaTag = document.querySelector('meta[name="theme-color"]');
  if (themeMetaTag) {
    themeMetaTag.setAttribute("content", themeColor); // Dynamically update the theme color
  }

  // Update time icon SVG color
  const timeIconPath = document.querySelector("#time-icon .timeicon");
  if (timeIconPath) {
    timeIconPath.style.fill = timeIconColor; // Set the fill color dynamically
    console.log("Time icon color updated:", timeIconColor); // Debugging
  } else {
    console.warn("Time icon not found in DOM.");
  }

  // Update timer text color
  const timerElement = document.querySelector("#timer");
  if (timerElement) {
    timerElement.style.color = timerColor; // Set the timer text color dynamically
  }

  // Update points icon SVG color
  const pointsIconPath = document.querySelector("#points-icon .st0");
  if (pointsIconPath) {
    pointsIconPath.style.fill = pointsIconColor; // Set the points icon fill color dynamically
  }

  // Update Wordle logo SVG color
  const wordleLogoPaths = document.querySelectorAll("#wordle-logo .logo-fill");
  if (wordleLogoPaths) {
    wordleLogoPaths.forEach((path) => {
      path.style.fill = wordleLogoColor;
    });
  }

  // Wait for tiles and update their background and border colors
  const waitForTiles = () => {
    const tiles = document.querySelectorAll("#board .tile");
    if (tiles.length > 0) {
      tiles.forEach((tile) => {
        tile.style.backgroundColor = tileColor; // Set the tile background color dynamically
        tile.style.borderColor = tileBorderColor; // Set the tile border color dynamically
        tile.style.color = tileTextColor; // Set the text color dynamically
      });
    } else {
      setTimeout(waitForTiles, 100); // Retry every 100ms
    }
  };

  waitForTiles(); // Start checking for tiles

  // Wait for buttons and update their styles
  const waitForButtons = () => {
    const buttons = document.querySelectorAll("#virtual-keyboard button");
    if (buttons.length > 0) {
      buttons.forEach((button) => {
        button.style.backgroundColor = buttonColor; // Set the button background color dynamically
        button.style.color = buttonTextColor; // Set the button text color dynamically
        button.style.borderColor = buttonBorderColor; // Set the button border color dynamically
      });
    } else {
      setTimeout(waitForButtons, 100); // Retry every 100ms
    }
  };

  waitForButtons(); // Start checking for buttons
}

// Call the function initially
updateBackgroundColor();

// Create Virtual Keyboard
function createVirtualKeyboard() {
    const keyboardContainer = document.getElementById("virtual-keyboard");
    const keys = [
      "qwertyuiop",
      "asdfghjkl",
      "zxcvbnm",
    ];
  
    keys.forEach((row, rowIndex) => {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("keyboard-row");
  
      // Split the row into keys
      row.split("").forEach((key) => {
        const button = document.createElement("button");
        button.textContent = key.toUpperCase();
        button.id = `key-${key}`;
        button.addEventListener("click", () => handleKeyboardInput(key));
        rowDiv.appendChild(button);
      });
  
      // Add the DELETE button next to the "m" on the bottom row
      if (rowIndex === 2) { 
        const deleteButton = document.createElement("button");
        deleteButton.id = "delete-button"; 
        deleteButton.textContent = "Delete"; 
        deleteButton.addEventListener("click", handleBackspace);
          // Apply styling directly
  deleteButton.style.fontSize = "10px"; 
  deleteButton.style.padding = "5px"; 
  deleteButton.style.textAlign = "center"; 
        rowDiv.appendChild(deleteButton);
      }
  
      keyboardContainer.appendChild(rowDiv);
    });
  }
  
  // Handle virtual keyboard input
  function handleKeyboardInput(key) {
    const tiles = Array.from(board.children);
  
    if (currentTileIndex < currentRowEnd) {
      const tile = tiles[currentTileIndex];
      if (!tile.textContent) { 
        tile.textContent = key.toUpperCase(); 
        currentTileIndex++; 
      }
    }
  }
  
  // Handle backspace input
  function handleBackspace() {
    const tiles = Array.from(board.children);
    if (currentTileIndex > currentRowStart) {
      currentTileIndex--;
      const tile = tiles[currentTileIndex];
      tile.textContent = "";
    }
  }
  
  // Handle guess submission
  function handleSubmit() {
    const tiles = Array.from(board.children);
    const guess = tiles
      .slice(currentRowStart, currentRowEnd)
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
  // Calculate the board's height
function calculateBoardHeight() {
  const board = document.getElementById("board");

  if (board) {
    const boardRect = board.getBoundingClientRect();
    const boardHeight = boardRect.height;
    console.log(`Height of the board: ${boardHeight}px`);
    return boardHeight;
  } else {
    console.error("Ensure that the #board element exists in the DOM.");
  }
}


// Create board and calculate height function
function createBoardAndCalculateHeight(wordLength) {
  createBoard(wordLength);
  setTimeout(() => {
    calculateBoardHeight(); // Calculate height after rendering
  }, 0);
}
function adjustGameContainerTop() {
  const gameContainer = document.getElementById("game-container");
  const board = document.getElementById("board");
  const titleContainer = document.getElementById("title-container");
  const virtualKeyboardContainer = document.getElementById("virtual-keyboard-container");

  if (gameContainer && board && titleContainer && virtualKeyboardContainer) {
    const titleContainerRect = titleContainer.getBoundingClientRect();
    const virtualKeyboardContainerRect = virtualKeyboardContainer.getBoundingClientRect();

    // Calculate the center pixel between the title and the virtual keyboard
    const titleBottom = titleContainerRect.bottom; // Bottom of title container
    const keyboardTop = virtualKeyboardContainerRect.top; // Top of virtual keyboard container
    const centerPixel = (titleBottom + keyboardTop) / 2;

    // Get half the board's height
    const boardHeight = board.offsetHeight;
    const halfBoardHeight = boardHeight / 2;

    // Adjust the game-container's top position by subtracting half the board height from centerPixel
    const topPosition = centerPixel - halfBoardHeight;

    // Set the top and horizontal centering of the game-container
    gameContainer.style.position = "absolute"; // Ensure absolute positioning
    gameContainer.style.top = `${topPosition}px`; // Set calculated top position
    gameContainer.style.left = "50%"; // Center horizontally
    gameContainer.style.transform = "translate(-50%, -50%)"; // Translate to center horizontally

    console.log(`Set game-container top to: ${topPosition}px and centered horizontally.`);
  } else {
    console.error("Ensure that #game-container, #board, #title-container, and #virtual-keyboard-container exist in the DOM.");
  }
}

// Call the function after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  adjustGameContainerTop();
});

// Recalculate on window resize
window.addEventListener("resize", adjustGameContainerTop);

// Call the function after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  printCenterBetweenElements(); // Optionally log the center pixel
});
// Call this function after the DOM has fully loaded and on window resize
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

  
