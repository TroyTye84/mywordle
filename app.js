import express from "express";
import path from "path";
import { generateWord } from "./openai.js";
import dotenv from "dotenv";

// Load environment variables at the start
dotenv.config();
console.log("API Key Loaded from app.js:", process.env.OPENAI_API_KEY); // Debugging

const app = express();
const PORT = 3000;

let dailyWord = null;

// Middleware
app.use(express.json());
console.log("Serving static files from:", path.resolve("public"));
app.use(express.static(path.resolve("public")));

// Endpoint to get the daily word
app.get("/daily-word", (req, res) => {
  if (!dailyWord) {
    return res.status(404).json({ error: "Daily word not yet generated." });
  }
  res.json({ word: dailyWord });
});

// Schedule the daily word generation
function scheduleDailyWord() {
  generateWord()
    .then((word) => {
      dailyWord = word;
      console.log("New daily word:", dailyWord);
    })
    .catch((err) => {
      console.error("Error generating daily word:", err.message);
    });

  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  const delay = nextMidnight - now;
  setTimeout(scheduleDailyWord, delay);
}

// Start the word generation on server startup
scheduleDailyWord();

// Serve the index.html file for the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
