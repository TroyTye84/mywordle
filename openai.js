import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateWord() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an assistant for a Wordle game. Always respond with a single word wrapped in square brackets. Example: [example]",
        },
        { role: "user", content: "Generate a unique word of random length." },
      ],
    });

    // Extract the word from the response
    const rawResponse = completion.choices[0].message.content.trim();
    const match = rawResponse.match(/\[([a-zA-Z]+)\]/); // Match [word]

    if (!match) {
      throw new Error(`Invalid response format: ${rawResponse}`);
    }

    const word = match[1].toLowerCase(); // Extract the word inside brackets
    console.log("Generated daily word (from brackets):", word);
    return word;
  } catch (error) {
    console.error("Error generating word:", error.message);
    throw error;
  }
}
