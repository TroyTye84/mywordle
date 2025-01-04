const timerDisplay = document.getElementById("timer");
const pointsDisplay = document.getElementById("points");
let timerInterval = null;
let elapsedTime = 0; // Start with 0 seconds
let points = 100; // Start with 100 points

// Start the timer
function startTimer() {
  elapsedTime = 0; // Reset the elapsed time for each game
  timerDisplay.textContent = `Time: ${elapsedTime}s`;
  timerInterval = setInterval(() => {
    elapsedTime++; // Increment elapsed time
    timerDisplay.textContent = `Time: ${elapsedTime}s`;

    // Deduct points as time increases
    subtractPoints(1);

    // Ensure points don't go below 0
    if (points <= 0) {
      points = 0;
      pointsDisplay.textContent = `Points: ${points}`;
      stopTimer(); // Stop the timer if points reach 0
      endGame(false); // End the game as a loss
    }
  }, 1000);
}

// Stop the timer
function stopTimer() {
  clearInterval(timerInterval);
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
    feedback.textContent = `Congratulations! You guessed the word in ${elapsedTime} seconds and earned ${points} points!`;
  } else {
    feedback.textContent = `Game over! Final score: ${points} points.`;
  }

  input.disabled = true;
  submitButton.disabled = true;
}

// Initialize the game
function initializeGame(wordLength) {
  elapsedTime = 0; // Reset the timer for each game
  points = 100; // Reset points for each game
  timerDisplay.textContent = `Time: ${elapsedTime}s`;
  pointsDisplay.textContent = `Points: ${points}`;
  startTimer();
}
