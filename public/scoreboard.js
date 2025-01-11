const scoreboardTable = document.getElementById("scoreboard").querySelector("tbody");

// Fetch and display scoreboard data
async function fetchScoreboard() {
  try {
    const response = await fetch("/scoreboard");
    if (!response.ok) {
      throw new Error(`Failed to fetch scoreboard: ${response.statusText}`);
    }
    const scores = await response.json();
    console.log("Fetched scores from API:", scores); // Debug the response here
    displayScoreboard(scores);
  } catch (error) {
    console.error("Error loading scoreboard:", error.message);
  }
}

// Display scoreboard data
function displayScoreboard(scores) {
  const scoreboardTable = document.getElementById("scoreboard").querySelector("tbody");
  const scoreboardWrapper = document.getElementById("scoreboard-wrapper"); // Scrollable container
  scoreboardTable.innerHTML = ""; // Clear existing rows

  // Sort scores by the word column alphabetically
  scores.sort((a, b) => {
    const wordA = (a.word || "").toLowerCase();
    const wordB = (b.word || "").toLowerCase();
    return wordA.localeCompare(wordB); // Sort alphabetically
  });

  // Extract the ID to highlight from the query string
  const urlParams = new URLSearchParams(window.location.search);
  const highlightedId = parseInt(urlParams.get("id")); // Get ID from query string

  let highlightedRow = null;

  // Populate the table
  scores.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.username}</td>
      <td>${entry.score}</td>
      <td>${entry.difficulty || "N/A"}</td>
      <td>${entry.word || "N/A"}</td>
    `;

    // Highlight the row if the ID matches
    if (entry.id === highlightedId) {
      row.classList.add("highlight"); // Add highlight class to the row
      highlightedRow = row; // Keep reference to the highlighted row
    }

    scoreboardTable.appendChild(row);
  });

  // Scroll to the highlighted row
  if (highlightedRow) {
    setTimeout(() => {
      const rowOffsetTop = highlightedRow.offsetTop;

      console.log("Highlighted Row Found:", highlightedRow);
      console.log("Row Offset Top:", rowOffsetTop);

      // Adjust scroll position of the wrapper
      scoreboardWrapper.scrollTop = rowOffsetTop;
    }, 0);
  }
}
// Initialize scoreboard
fetchScoreboard();
// Function to handle the Share button click
function addShareButton() {
  const shareButton = document.getElementById("share-button");
  const previousPageUrl = document.referrer || "index.html"; // Use referrer or default to index

  // Extract the score from the query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const score = urlParams.get("score") || "N/A"; // Default to "N/A" if no score is provided

  const message = `Can you beat me at Wordle? I SCORED ${score} ⭐️!`;
  const shareData = {
    title: "Can you beat me at Wordle?",
    text: message,
    url: previousPageUrl,
  };

  shareButton.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        alert("Challenge shared successfully!");
      } catch (error) {
        console.error("Error sharing via Web Share API:", error);
        alert("Sharing failed. Please try again.");
      }
    } else {
      alert("Sharing is not supported on this device.");
    }
  });
}

// Call the function after the page loads
addShareButton();
