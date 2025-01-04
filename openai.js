const OpenAI = require("openai");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js"); // Import Supabase

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase configuration is missing.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateWord() {
  try {
    // Fetch the used words from the database
    const { data: usedWords, error } = await supabase
      .from("used_words")
      .select("word");

    if (error) {
      console.error("Error fetching used words:", error.message);
      throw new Error("Could not fetch used words.");
    }

    // Create a list of words to exclude
    const usedWordsList = usedWords.map((row) => row.word).join(", ");

    // Send the used words to the AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an assistant for a Wordle game. Generate a unique word of random length that has not been used before. Avoid the following words: ${usedWordsList}. The word must exist in the Oxford Dictionary. Always respond with a single word wrapped in square brackets, followed by its difficulty in curly brackets. Example: [example]{medium}`,
        },
        { role: "user", content: "Generate a new word." },
      ],
    });

    const rawResponse = completion.choices[0].message.content.trim();
    const wordMatch = rawResponse.match(/\[([a-zA-Z]+)\]/);
    const difficultyMatch = rawResponse.match(/\{(easy|medium|hard)\}/);

    if (!wordMatch || !difficultyMatch) {
      throw new Error(`Invalid response format: ${rawResponse}`);
    }

    const word = wordMatch[1].toLowerCase();
    const difficulty = difficultyMatch[1].toLowerCase();

    console.log("Generated daily word and difficulty:", { word, difficulty });
    return { word, difficulty };
  } catch (error) {
    console.error("Error generating word:", error.message);
    throw error;
  }
}

module.exports = { generateWord };
