const scoreboardTable = document.getElementById("scoreboard").querySelector("tbody");
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
  scoreboardTable.innerHTML = ""; // Clear existing rows

  // Extract the ID to highlight from the query string
  const urlParams = new URLSearchParams(window.location.search);
  const highlightedId = parseInt(urlParams.get("id")); // Get ID from query string

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
    }

    scoreboardTable.appendChild(row);
  });
}

// Initialize scoreboard
fetchScoreboard();
// Function to handle the Share button click
function addShareButton(score) {
  const shareButton = document.getElementById("share-button");
  const currentUrl = window.location.href.split("?")[0]; // Get the current page URL without query params
  const message = `Can you beat me? I scored ${score}! Play here: ${currentUrl}`;

  shareButton.addEventListener("click", async () => {
    if (navigator.share) {
      // Use Web Share API if supported
      try {
        await navigator.share({
          title: "Challenge your friends!",
          text: message,
          url: currentUrl,
        });
        alert("Challenge shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
        alert("Could not share the challenge.");
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(message);
        alert("Message copied to clipboard. Share it with your friends!");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        alert("Could not copy the message to clipboard.");
      }
    }
  });
}

// Example usage: Pass the score to the addShareButton function
const playerScore = 70; // Replace with the actual score
addShareButton(playerScore);