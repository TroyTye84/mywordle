const board = document.getElementById("board");
const input = document.getElementById("guess-input");
const submitButton = document.getElementById("submit-guess");
const feedback = document.getElementById("feedback");
let dailyWord = "";

// Fetch the daily word from the server
async function fetchDailyWord() {
  try {
    const response = await fetch("/daily-word");
    const data = await response.json();
    dailyWord = data.word.toLowerCase();
    console.log("Daily word fetched:", dailyWord); // For debugging

    createBoard(dailyWord.length); // Adjust the board based on the word length
    input.maxLength = dailyWord.length; // Dynamically adjust input maxlength
    input.placeholder = `Enter a ${dailyWord.length}-letter word`; // Update placeholder

    initializeGame(dailyWord.length); // Initialize timer and points system
  } catch (error) {
    console.error("Failed to fetch daily word:", error);
    feedback.textContent = "Error fetching daily word. Try again later.";
  }
}

// Create the game board dynamically
function createBoard(wordLength) {
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`; // Adjust the grid layout dynamically
  for (let i = 0; i < 6 * wordLength; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    board.appendChild(tile);
  }
}

// Check the user's guess
function checkGuess(guess) {
  if (guess.length !== dailyWord.length) {
    feedback.textContent = `Please enter a ${dailyWord.length}-letter word.`;
    subtractPoints(1); // Deduct points for invalid input
    return;
  }

  const tiles = Array.from(board.children);
  const start = tiles.findIndex((tile) => !tile.textContent);
  const end = start + dailyWord.length;

  for (let i = 0; i < dailyWord.length; i++) {
    const tile = tiles[start + i];
    tile.textContent = guess[i];
    if (guess[i] === dailyWord[i]) {
      tile.classList.add("correct");
    } else if (dailyWord.includes(guess[i])) {
      tile.classList.add("present");
    } else {
      tile.classList.add("absent");
    }
  }

  if (guess === dailyWord) {
    addPoints(10 + timeLeft); // Add points for winning, bonus for time left
    endGame(true); // Win the game
  } else if (end >= tiles.length) {
    feedback.textContent = `Game Over! The word was: ${dailyWord}`;
    subtractPoints(5); // Deduct points for losing
    endGame(false); // Lose the game
  }
}

// Handle guess submission
function handleSubmit() {
  const guess = input.value.toLowerCase();
  checkGuess(guess);
  input.value = "";
  input.focus();
}

// Event listeners
submitButton.addEventListener("click", handleSubmit);
input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") handleSubmit();
});

// Initialize the game
fetchDailyWord();
