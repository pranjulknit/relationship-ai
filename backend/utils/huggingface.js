// huggingface.js (Refactored to avoid duplicate prompt generation)

const axios = require("axios");
require("dotenv").config();

const HF_API_URL = "https://api-inference.huggingface.co/models";
const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

const analyzeSentiment = async (text) => {
  try {
    const response = await axios.post(
      `${HF_API_URL}/distilbert-base-uncased-finetuned-sst-2-english`,
      { inputs: text },
      { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
    );
    const result = response.data[0];
    const score = result.find(r => r.label === "POSITIVE")?.score || 0;
    const negScore = result.find(r => r.label === "NEGATIVE")?.score || 0;
    return Number(((score - negScore) * 2 - 1).toFixed(2)) || 0;
  } catch (err) {
    console.error("Hugging Face sentiment error:", err.message);
    return 0;
  }
};

const generatePrompt = async (phase, contactName, memories, lastSentiment) => {
  const memoryText = memories.length > 0 ? memories[memories.length - 1].content : "";
  const lastPrompt = memories.findLast(m => m.isPrompt && m.phase === phase)?.content || "";

  const systemPrompt = `
You are a supportive assistant helping someone reflect on their relationship with ${contactName}.

Your task: Ask a thoughtful, emotionally intelligent question for the "${phase}" phase.

Context: The user's last input was: "${memoryText}" (sentiment score: ${lastSentiment}).

Rules:
- The question should be about ${contactName}, not the user.
- Avoid any explanation, instructions, or reasoning.
- Do NOT repeat this previous prompt: "${lastPrompt}"
- The question must invite reflection, be relevant to the phase, and sound natural.
- Use 15–20 words only.
- Output ONLY the question — do NOT include anything else.
  `;

  try {
    const response = await axios.post(
      `${HF_API_URL}/mistralai/Mixtral-8x7B-Instruct-v0.1`,
      {
        inputs: `<s>[INST] ${systemPrompt} [/INST]`,
        parameters: { max_new_tokens: 50, return_full_text: false }
      },
      { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
    );
    let prompt = response.data[0]?.generated_text || `Tell me more about your time with ${contactName}.`;
    prompt = prompt.replace(/\[.*?\]|\(.*?\)|Note:|Explanation:|"""/gi, "").trim();
    return prompt;
  } catch (err) {
    console.error("Hugging Face prompt error:", err.message);
    return `Tell me more about your time with ${contactName}.`;
  }
};

const generateSummary = async (contactName, memories) => {
  const memoryText = memories.map(m => `${m.content} (sentiment: ${m.sentiment})`).join("\n");
  const systemPrompt = `Summarize reflections about ${contactName} based on these memories:\n${memoryText}\nProvide a 2-3 sentence summary with one actionable suggestion.`;
  try {
    const response = await axios.post(
      `${HF_API_URL}/mistralai/Mixtral-8x7B-Instruct-v0.1`,
      {
        inputs: `<s>[INST] ${systemPrompt} [/INST]`,
        parameters: { max_new_tokens: 100, return_full_text: false }
      },
      { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
    );
    let summary = response.data[0]?.generated_text || `You shared about ${contactName}. Keep reflecting to deepen your insights.`;
    summary = summary.replace(/\[.*?\]|\(.*?\)|Note:|Explanation:|"""/gi, "").trim();
    return summary;
  } catch (err) {
    console.error("Hugging Face summary error:", err.message);
    return `You shared about ${contactName}. Keep reflecting to deepen your insights.`;
  }
};

module.exports = { analyzeSentiment, generatePrompt, generateSummary };
