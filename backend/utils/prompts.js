const { generatePrompt } = require("./huggingface");

module.exports = { getPrompts: generatePrompt }; // Wrapper for compatibility