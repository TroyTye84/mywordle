let currentTileIndex = 0;
let maxTiles = 0;
let currentRowStart = 0;
let currentRowEnd = 0;
let wordLength = 0; // Length of the daily word
let wordDifficulty; // Declare globally to share with other functions

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
  timerDisplay.textContent = `${timeElapsed}s`;

  const timerInterval = setInterval(() => {
    timeElapsed++;
    timerDisplay.textContent = `${timeElapsed}s`;
  }, 1000);

  // Store the timerInterval for clearing later if needed
  window.timerInterval = timerInterval;
}
// Check the user's guess
function checkGuess(guess) {
  if (guess.length !== wordLength) {
    feedback.textContent = `Please enter a ${wordLength}-letter word.`;
    return;
  }

  const tiles = Array.from(board.children);
  const letterCount = {}; // Track occurrences of letters in the daily word
  let guessPoints = 0;

  // Count each letter in the daily word
  for (let letter of dailyWord) {
    letterCount[letter] = (letterCount[letter] || 0) + 1;
  }

  // First pass: Check for correct positions
  for (let i = 0; i < wordLength; i++) {
    const tile = tiles[currentRowStart + i];
    const keyButton = document.getElementById(`key-${guess[i]}`);

    if (guess[i] === dailyWord[i]) {
      tile.classList.add("correct");
      if (keyButton) keyButton.classList.add("correct");
      guessPoints += 5; // Add 5 points for correct position
      letterCount[guess[i]]--; // Decrement count for matched letter
    }
  }

  // Second pass: Check for correct letters in the wrong position
  for (let i = 0; i < wordLength; i++) {
    const tile = tiles[currentRowStart + i];
    const keyButton = document.getElementById(`key-${guess[i]}`);

    if (guess[i] !== dailyWord[i] && dailyWord.includes(guess[i]) && letterCount[guess[i]] > 0) {
      tile.classList.add("present");
      if (keyButton && !keyButton.classList.contains("correct")) {
        keyButton.classList.add("present");
      }
      guessPoints += 2; // Add 2 points for correct letter in wrong position
      letterCount[guess[i]]--; // Decrement count for matched letter
    } else if (!dailyWord.includes(guess[i])) {
      tile.classList.add("absent");
      if (keyButton) keyButton.classList.add("absent");
    }
  }

  // Add points for this guess
  addPoints(guessPoints);

  // Check if the player guessed the word
  if (guess === dailyWord) {
    addPoints(10 + timeLeft); // Add bonus points for winning and remaining time
    showNamePopup(); // Show name input popup when the game is completed
  } else if (currentRowEnd >= maxTiles) {
    feedback.textContent = `Game Over! The word was: ${dailyWord}`;
    endGame(false); // Lose the game
  }
}

// Show the popup to save the score
function showNamePopup() {
  const popup = document.createElement("div");
  popup.classList.add("popup");
  popup.innerHTML = `
    <div class="popup-content">
      <h2>Congratulations! Enter your name to save your score:</h2>
      <input type="text" id="name-input" placeholder="Enter your name" />
      <button id="save-score">Save Score</button>
      <button id="close-popup">Close</button>
    </div>
  `;
  document.body.appendChild(popup);

  const saveButton = document.getElementById("save-score");
  const closeButton = document.getElementById("close-popup");

  saveButton.addEventListener("click", async () => {
    const nameInput = document.getElementById("name-input");
    const username = nameInput.value.trim();
  
    if (!username) {
      alert("Please enter a valid name.");
      return;
    }
  
    const difficulty = wordDifficulty; // Use the global wordDifficulty
    const word = dailyWord; // Use the global dailyWord
  
    try {
      const { data, error } = await supabase.from("scores").insert([
        { username, score: points, difficulty, word }
      ]).select(); // Fetch the inserted row(s)
  
      if (error) throw error;
  
      alert("Your score has been saved!");
      popup.remove();
  
      // Redirect to the scoreboard with the new row's ID as a query parameter
      if (data && data.length > 0) {
        const newId = data[0].id;
        window.location.href = `scoreboard.html?id=${encodeURIComponent(newId)}`;
      }
    } catch (error) {
      alert(`Error saving score: ${error.message}`);
    }
  });

  closeButton.addEventListener("click", () => popup.remove());
}


// Add points to the player's score
function addPoints(value) {
  points += value;
  pointsDisplay.textContent = `Points: ${points}`;
}

// Initialize the game
document.addEventListener("DOMContentLoaded", () => {
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

  if (win) {
    feedback.textContent = `You guessed the word! Your score is ${points}`;
  } else {
    feedback.textContent = "Game Over! Better luck next time!";
  }

  submitButton.disabled = true;
}

