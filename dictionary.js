const fs = require("fs");
const path = require("path");

// Load the dictionary into a Set
const loadDictionary = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return new Set(fileContent.split("\n").map(word => word.trim().toLowerCase()));
};

const dictionaryPath = path.join(__dirname, "data", "words.txt");
const dictionary = loadDictionary(dictionaryPath);

console.log(`Loaded dictionary with ${dictionary.size} words.`);

module.exports = dictionary;
