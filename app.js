const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const { generateWord } = require("./openai.js"); // Your word generation logic
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

let dailyWord = null; // Will store both word and difficulty

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve("public")));

// Validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase configuration is missing.");
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// Load the dictionary into a Set
const loadDictionary = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return new Set(fileContent.split("\n").map(word => word.trim().toLowerCase()));
};

const dictionaryPath = path.join(__dirname, "data", "words.txt");
const dictionary = loadDictionary(dictionaryPath);

console.log(`Loaded dictionary with ${dictionary.size} words.`);
// Endpoint to retrieve the daily word
app.get("/daily-word", async (req, res) => {
  if (!dailyWord) {
    return res.status(404).json({ error: "Daily word not yet generated." });
  }

  try {
    // Check if the word already exists in the database
    const { data: existingWord, error: fetchError } = await supabase
      .from("used_words")
      .select("word")
      .eq("word", dailyWord.word)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // If the error is not a "No rows" error, log it
      console.error("Error checking for existing word:", fetchError.message);
      throw fetchError;
    }

    if (!existingWord) {
      // Only insert the word if it doesn't already exist
      const { error: insertError } = await supabase
        .from("used_words")
        .insert([{ word: dailyWord.word }]);

      if (insertError) {
        console.error("Error saving used word:", insertError.message);
        throw insertError;
      }
    } else {
      console.log(`Word "${dailyWord.word}" already exists in the database.`);
    }

    res.json(dailyWord);
  } catch (err) {
    console.error("Error in /daily-word endpoint:", err.message);
    res.status(500).json({ error: "Failed to process daily word." });
  }
});

// Endpoint to fetch Supabase configuration
app.get("/supabase-config", (req, res) => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Supabase configuration missing." });
  }

  res.json({ SUPABASE_URL, SUPABASE_KEY });
});
// Endpoint to validate a word against the dictionary
app.get("/validate-word", (req, res) => {
  const { word } = req.query;

  if (!word) {
    return res.status(400).json({ error: "Word is required." });
  }

  const isValid = dictionary.has(word.toLowerCase());
  res.json({ valid: isValid });
});

// Endpoint to fetch the scoreboard
app.get("/scoreboard", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("scores")
      .select("id, username, score, difficulty, word")
      .order("score", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error fetching scoreboard:", error.message);
    res.status(500).json({ error: "Failed to fetch scoreboard." });
  }
});

// Endpoint to save user scores
app.post("/save-score", async (req, res) => {
  const { userId, username, score, word, difficulty } = req.body;

  if (!username || !score || !word || !difficulty) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const { data, error } = await supabase.from("scores").insert([
      {
        user_id: userId || null,
        username,
        score,
        word,
        difficulty,
      },
    ]);

    if (error) throw error;

    res.json({ message: "Score saved successfully!", data });
  } catch (error) {
    console.error("Error saving score:", error.message);
    res.status(500).json({ error: "Failed to save score." });
  }
});

// Function to schedule daily word generation
function scheduleDailyWord() {
  generateWord()
    .then((data) => {
      dailyWord = data; // Save the full object: { word, difficulty }
      console.log("New daily word generated:", dailyWord);
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

// Start the word generation process
scheduleDailyWord();

// Serve the index.html file for the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
