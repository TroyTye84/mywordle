let currentTileIndex = 0;
let maxTiles = 0;
let currentRowStart = 0;
let currentRowEnd = 0;
let wordLength = 0; // Length of the daily word
let wordDifficulty; // Declare globally to share with other functions
let attemptNumber = 0; // Track the current attempt number
let keydownHandlerActive = true; // Track if keydown listener is active
let gameActive = true; // Track if the game is active
let initialViewportHeight = window.innerHeight;

// Fetch Supabase Configuration
async function loadSupabaseConfig() {
  try {
    const response = await fetch("/supabase-config");
    if (!response.ok) {
      throw new Error("Failed to fetch Supabase configuration.");
    }

    const { SUPABASE_URL, SUPABASE_KEY } = await response.json();
    console.log("Supabase configuration received:", { SUPABASE_URL, SUPABASE_KEY });

    // Create and return the Supabase client
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (error) {
    console.error("Error loading Supabase configuration:", error.message);
    alert("Failed to load Supabase configuration. Please try again later.");
    return null;
  }
}

// Initialize Supabase client
let supabase;
(async () => {
  supabase = await loadSupabaseConfig();
  if (supabase) {
    console.log("Supabase initialized successfully");
  }
})();

// DOM Elements
const board = document.getElementById("board");
const submitButton = document.getElementById("submit-guess");
const feedback = document.getElementById("feedback");
let dailyWord = "";
let timeLeft = 60;
let points = 0; // Store the points
const timerDisplay = document.getElementById("timer");
const pointsDisplay = document.getElementById("points");

// Fetch the daily word from the server
async function fetchDailyWord() {
  try {
    // Wait until Supabase is initialized
    while (!supabase) {
      console.log("Waiting for Supabase to initialize...");
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms
    }

    const response = await fetch("/daily-word");
    if (!response.ok) {
      throw new Error("Failed to fetch daily word.");
    }

    const data = await response.json();
    dailyWord = data.word.toLowerCase();
    wordLength = dailyWord.length;
    wordDifficulty = data.difficulty;

    console.log("Daily word fetched:", dailyWord);
    console.log("Word difficulty fetched:", wordDifficulty);

    createBoard(wordLength);
    initializeGame();

    // Optional: Display difficulty to the player
    const difficultyDisplay = document.getElementById("difficulty");
    if (difficultyDisplay) {
      difficultyDisplay.textContent = `Difficulty: ${wordDifficulty}`;
    }
  } catch (error) {
    console.error("Failed to fetch daily word:", error);
    feedback.textContent = "Error fetching daily word. Try again later.";
  }
}


// Timer functions
function startTimer() {
  let timeElapsed = 0; // Initialize the counter
  timerDisplay.textContent = `${timeElapsed}`;

  const timerInterval = setInterval(() => {
    timeElapsed++;
    timerDisplay.textContent = `${timeElapsed}`;
  }, 1000);

  // Store the timerInterval for clearing later if needed
  window.timerInterval = timerInterval;
}


document.addEventListener("keydown", (event) => {
  if (!gameActive || !keydownHandlerActive) return; // Ignore key presses if game is inactive or popup is shown

  const key = event.key;

  // Allow only alphabetical characters
  if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
    // Prevent input if currentTileIndex exceeds the board size or current row's boundary
    if (currentTileIndex >= maxTiles || currentTileIndex >= currentRowStart + wordLength) {
      console.log("Cannot add more letters. Row is full or board limit reached.");
      return;
    }

    // Add the letter to the tile
    const tile = board.children[currentTileIndex];
    if (tile) {
      tile.textContent = key.toUpperCase(); // Add the letter
      currentTileIndex++; // Move to the next tile
    }
  }

  // Handle backspace
  if (key === "Backspace" && currentTileIndex > currentRowStart) {
    currentTileIndex--; // Move back one tile
    const tile = board.children[currentTileIndex];
    if (tile) {
      tile.textContent = ""; // Clear the letter
    }
  }
});
function showFeedbackMessage(message) {
  // Create a temporary feedback element
  const feedbackPopup = document.createElement("div");
  feedbackPopup.textContent = message;
  feedbackPopup.classList.add("feedback-popup");

  // Add the feedback element to the body
  document.body.appendChild(feedbackPopup);

  // Start the fade-out after 2 seconds
  setTimeout(() => {
    feedbackPopup.classList.add("fade-out");
  }, 1000); // 2-second delay

  // Remove the feedback element after the fade-out animation completes (e.g., 2s fade-out)
  setTimeout(() => {
    feedbackPopup.remove();
  }, 2000); // 2 seconds (delay) + 2 seconds (fade-out duration)
}
// Check the user's guess
async function checkGuess(guess) {
  if (guess.length !== wordLength) {
    feedback.textContent = `Please enter a ${wordLength}-letter word.`;
    return;
  }

  console.log(`Attempt number: ${attemptNumber}`);

  const tiles = Array.from(board.children);
  const currentRowTiles = tiles.slice(currentRowStart, currentRowStart + wordLength);
  const currentRowLetters = currentRowTiles.map((tile, index) => {
    const tileIndex = currentRowStart + index;
    console.log(`Tile ${tileIndex}: ${tile.textContent || " "}`);
    return tile.textContent || " ";
  });

  console.log("Current Row Letters:", currentRowLetters.join(""));

  // Validate the guess by calling the server
  const response = await fetch(`/validate-word?word=${encodeURIComponent(guess)}`);
  const { valid } = await response.json();

  if (!valid) {
    showFeedbackMessage(`"${guess}" is not a valid word. Please try again!`);

    const correctRowStart = Math.floor((currentTileIndex - 1) / wordLength) * wordLength;

    // Clear the characters in the correct row
    for (let i = correctRowStart; i < correctRowStart + wordLength; i++) {
      const tile = tiles[i];
      tile.textContent = ""; // Clear letter
      tile.classList.remove("correct", "present", "absent");
      tile.style.backgroundColor = "";
      tile.style.borderColor = "";
    }

    // Reset tile index, row start, and row end
    currentTileIndex = correctRowStart;
    currentRowStart = correctRowStart;
    currentRowEnd = correctRowStart + wordLength;
    console.log("Tile index reset to:", currentTileIndex);
    console.log("Row start reset to:", currentRowStart);
    console.log("Row end reset to:", currentRowEnd);

    return; // Exit early for invalid word
  }

  // Increment attemptNumber only for valid guesses
  attemptNumber++; 
  console.log(`Valid attempt number: ${attemptNumber}`);

  const previousRowStart = currentRowStart - wordLength;
  const letterCount = {};
  let guessPoints = 0;

  // Count each letter in the daily word
  for (let letter of dailyWord) {
    letterCount[letter] = (letterCount[letter] || 0) + 1;
  }

   // First pass: Check for correct positions
   const exactMatches = new Array(wordLength).fill(false);
   for (let i = 0; i < wordLength; i++) {
     const tile = tiles[previousRowStart + i];
     const keyButton = document.getElementById(`key-${guess[i]}`);
 
     if (guess[i] === dailyWord[i]) {
       tile.classList.add("correct");
       if (keyButton) keyButton.classList.add("correct");
       letterCount[guess[i]]--;
       exactMatches[i] = true;
 
       // Award points for correct position
       guessPoints += 10; // Example: 10 points for correct position
     }
   }
// Second pass: Check for correct letters in the wrong position
for (let i = 0; i < wordLength; i++) {
  const tile = tiles[previousRowStart + i];
  const keyButton = document.getElementById(`key-${guess[i]}`);

  if (exactMatches[i]) continue;

  if (dailyWord.includes(guess[i]) && letterCount[guess[i]] > 0) {
    tile.classList.add("present");
    if (keyButton && !keyButton.classList.contains("correct")) {
      keyButton.classList.add("present");
    }
    letterCount[guess[i]]--;

    // Award points for correct letter in wrong position
    guessPoints += 5; // Example: 5 points for wrong position
  } else {
    tile.classList.add("absent");
    if (keyButton && !keyButton.classList.contains("correct") && !keyButton.classList.contains("present")) {
      keyButton.classList.add("absent");
    }
  }
}

  addPoints(guessPoints);

  // Check if the player guessed the word
  if (guess === dailyWord) {
    // Award points based on the attempt number
    switch (attemptNumber) {
      case 1:
        addPoints(500);
        break;
      case 2:
        addPoints(400);
        break;
      case 3:
        addPoints(300);
        break;
      case 4:
        addPoints(200);
        break;
      case 5:
        addPoints(100);
        break;
      default:
        addPoints(0);
    }

    clearInterval(window.timerInterval);
    showNamePopup();
  } else if (attemptNumber >= 6) { 
    showGameOverMessage(`${dailyWord.toUpperCase()}`);
    endGame(false);
  
  }
}
function showGameOverMessage(word) {
  // Create an overlay
  const overlay = document.createElement("div");
  overlay.classList.add("game-over-overlay");

  // Create the message container
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("game-over-message");

  // Add the structured message
  messageContainer.innerHTML = `
    <h1 class="game-over-title">Game Over!</h1>
    <p class="game-over-text">The word was:</p>
    <p class="game-over-word">${word.toUpperCase()}</p>
  `;

  // Append the message container to the overlay
  overlay.appendChild(messageContainer);

  // Append the overlay to the body
  document.body.appendChild(overlay);

  // Trigger the animations
  setTimeout(() => {
    overlay.classList.add("fade-in");
    messageContainer.classList.add("slide-to-center");
  }, 50);
}
// Show the popup to save the score
function showNamePopup() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });

  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.position = 'absolute';
    canvas.style.zIndex = '1001'; // Ensure it is above the popup
  }

  // Temporarily disable the global keydown handler
  keydownHandlerActive = false;

  // Create a popup element dynamically
  const popup = document.createElement("div");
  popup.classList.add("popup");
  popup.innerHTML = `
    <div class="popup-content">
      <h2 class="popup-title">Congratulations!</h2>
      <h2 class="popup-subtitle">You solved the Wordle</h2>
      <h1 class="popup-word">${dailyWord.toUpperCase()}</h1>
      <h2 class="popup-points">${points} pts</h2>
      <input type="text" id="name-input" class="popup-input" placeholder="Enter your name" />
      <button id="save-score" class="popup-save-button">Save</button>
    </div>
  `;
  document.body.appendChild(popup);

  // Handle input field focus and typing
  const nameInput = document.getElementById("name-input");
  nameInput.addEventListener("keydown", (event) => {
    event.stopPropagation(); // Prevent this input from triggering global listeners
  });

  // Save score and restore global keydown handling
  const saveButton = document.getElementById("save-score");
  saveButton.addEventListener("click", async () => {
    const username = nameInput.value.trim();
    if (!username) {
      alert("Please enter a valid name.");
      return;
    }

    try {
      // Save the score to the database
      const { data, error } = await supabase.from("scores").insert([
        { username, score: points, difficulty: wordDifficulty, word: dailyWord }
      ]).select();

      if (error) throw error;
      popup.remove();

      // Restore the global keydown handler
      keydownHandlerActive = true;

      if (data && data.length > 0) {
        const newId = data[0].id;
        window.location.href = `scoreboard.html?id=${encodeURIComponent(newId)}&score=${encodeURIComponent(points)}`;
      }
    } catch (error) {
      alert(`Error saving score: ${error.message}`);
    }
  });
}

// Add points to the player's score
function addPoints(value) {
  // Increment the points by the specified value
  points += value;
  
  // Update only the points value
  const pointsValue = document.getElementById("points-value");
  pointsValue.textContent = points; // Update the number without affecting the icon
}
// Initialize the game
document.addEventListener("DOMContentLoaded", () => {
  // Commented out: Check for saved game state in localStorage
  // const savedState = localStorage.getItem("gameCompleted");

  // if (savedState) {
  //   console.log("Game state found in localStorage on load:", JSON.parse(savedState));
  // } else {
  //   console.log("No game state found in localStorage on load.");
  // }

  // const currentDate = new Date().toISOString().split("T")[0];
  // const gameState = savedState ? JSON.parse(savedState) : null;

  // If the game is completed for today, disable the game
  // if (gameState && gameState.date === currentDate && gameState.completed) {
  //   feedback.textContent = "You already completed today's Wordle! Come back tomorrow.";
  //   gameActive = false;
  //   keydownHandlerActive = false;
  //   submitButton.disabled = true;
  //   return;
  // }

  // Initialize the game as usual
  createVirtualKeyboard();
  fetchDailyWord();
  submitButton.addEventListener("click", handleSubmit);
});

// Initialize the timer
function initializeGame() {
  startTimer();
}

// End the game
function endGame(win) {
  clearInterval(window.timerInterval); // Stop the timer

  const currentDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  if (win) {
    feedback.textContent = `You guessed the word! Your score is ${points}`;
    showNamePopup();
  }
  // Save the completed state with today's date in localStorage
  const gameState = { date: currentDate, completed: true };
  localStorage.setItem("gameCompleted", JSON.stringify(gameState));

  // Print the stored value to the console for debugging
  console.log("Game state saved to localStorage:", localStorage.getItem("gameCompleted"));

  gameActive = false; // Disable further gameplay
  keydownHandlerActive = false; // Disable key inputs
  submitButton.disabled = true; // Disable the submit button
}
document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name-input");
  const body = document.body;

  if (nameInput) {
    // Disable scrolling when the keyboard is active
    nameInput.addEventListener("focus", () => {
      body.style.overflow = "hidden"; // Prevent scrolling
      console.log("Keyboard opened. Scrolling disabled.");
    });

    // Re-enable scrolling and adjust layout when the keyboard is dismissed
    nameInput.addEventListener("blur", () => {
      body.style.overflow = ""; // Restore scrolling
      console.log("Keyboard dismissed. Recalculating layout...");
      setTimeout(() => {
        adjustGameContainerTop();
        adjustBoardSizeProportionally();
      }, 300); // Delay ensures keyboard is fully dismissed
    });
  }
});