const Session = require("../models/Session");
const Relationship = require("../models/Relationship");
const textToSpeech = require("@google-cloud/text-to-speech");
const prompts = require("../utils/prompts");

const ttsClient = new textToSpeech.TextToSpeechClient();

exports.startSession = async (req, res) => {
  const { userId, relationshipId } = req.body;
  try {
    const session = new Session({ userId, relationshipId, phase: "onboarding", promptIndex: 0, transcript: "" });
    await session.save();
    const relationship = await Relationship.findById(relationshipId);
    const prompt = prompts.onboarding[0].replace("{name}", relationship.contactName);
    const [ttsResult] = await ttsClient.synthesizeSpeech({
      input: { text: prompt },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" }
    });
    res.json({ sessionId: session._id, prompt, audio: ttsResult.audioContent.toString("base64") });
  } catch (err) {
    res.status(500).json({ message: "Error starting session" });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate("relationshipId");
    const memories = await Relationship.findById(session.relationshipId).select("memories");
    const summary = `You shared about ${session.relationshipId.contactName}. ${
      memories.memories.some(m => m.sentiment > 0)
        ? "You mentioned some positive moments."
        : "You talked about some challenges."
    }`;
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: "Error fetching summary" });
  }
};