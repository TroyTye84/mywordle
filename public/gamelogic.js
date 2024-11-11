const timerDisplay = document.getElementById("timer");
const pointsDisplay = document.getElementById("points");
let timerInterval = null;
let timeLeft = 60; // Initial time in seconds
let points = 100; // Start with 100 points

// Start the timer
function startTimer() {
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;

    // Deduct points for time taken
    subtractPoints(1);

    // Ensure points don't go below 0
    if (points <= 0) {
      points = 0;
      pointsDisplay.textContent = `Points: ${points}`;
    }
  }, 1000);
}

// Stop the timer
function stopTimer() {
  clearInterval(timerInterval);
}

// Add time to the timer
function addTime(seconds) {
  timeLeft += seconds;
  timerDisplay.textContent = `Time: ${timeLeft}s`;
}

// Add points to the player's score
function addPoints(value) {
  points += value;
  pointsDisplay.textContent = `Points: ${points}`;
}

// Subtract points from the player's score
function subtractPoints(value) {
  points -= value;
  if (points < 0) points = 0; // Ensure points don’t go negative
  pointsDisplay.textContent = `Points: ${points}`;
}

// End the game (true = win, false = lose)
function endGame(win) {
  stopTimer();
  const feedback = document.getElementById("feedback");
  const input = document.getElementById("guess-input");
  const submitButton = document.getElementById("submit-guess");

  if (win) {
    feedback.textContent = `Congratulations! You guessed the word and earned ${points} points!`;
  } else {
    feedback.textContent = `Time's up! Final score: ${points} points.`;
  }

  input.disabled = true;
  submitButton.disabled = true;
}

// Initialize the game
function initializeGame(wordLength) {
  timeLeft = 60; // Reset timer for each game
  points = 100; // Start with 100 points
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  pointsDisplay.textContent = `Points: ${points}`;
  startTimer();
}
