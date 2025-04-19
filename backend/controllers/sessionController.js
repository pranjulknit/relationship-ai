const Session = require("../models/Session");
const Relationship = require("../models/Relationship");
const textToSpeech = require("@google-cloud/text-to-speech");
const { getPrompts } = require("../utils/prompts");
const { generateSummary } = require("../utils/huggingface");
const { console } = require("inspector");

const ttsClient = new textToSpeech.TextToSpeechClient();

exports.startSession = async (req, res) => {
  const { userId, relationshipId } = req.body;
  try {
    const session = new Session({ userId, relationshipId, phase: "onboarding", promptIndex: 0, transcript: "" });
    await session.save();
    console.log("Session started:", session._id);
    const relationship = await Relationship.findById(relationshipId);
    console.log("Relationship found:", relationship);
    const prompt = await getPrompts("onboarding", relationship.contactName, [], 0);
    const [ttsResult] = await ttsClient.synthesizeSpeech({
      input: { text: prompt },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" }
    });
    console.log("TTS result:", ttsResult.audioContent);
    res.json({ sessionId: session._id, prompt, audio: ttsResult.audioContent.toString("base64") });
  } catch (err) {
    
    res.status(500).json({ message: `Error starting session ${err}` });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate("relationshipId");
    const relationship = await Relationship.findById(session.relationshipId);
    const summary = await generateSummary(relationship.contactName, relationship.memories);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: "Error fetching summary" });
  }
};