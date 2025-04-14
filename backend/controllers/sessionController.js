const Session = require("../models/Session");
const Relationship = require("../models/Relationship");
const textToSpeech = require("@google-cloud/text-to-speech");
const { getPrompts } = require("../utils/prompts");

const ttsClient = new textToSpeech.TextToSpeechClient();

exports.startSession = async (req, res) => {
  const { userId, relationshipId } = req.body;
  try {
    const session = new Session({ userId, relationshipId, phase: "onboarding", promptIndex: 0, transcript: "" });
    await session.save();
    const relationship = await Relationship.findById(relationshipId);
    const prompts = getPrompts("onboarding", relationship.contactName);
    const prompt = prompts[0];
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
    const relationship = await Relationship.findById(session.relationshipId);
    const memories = relationship.memories || [];

    // Calculate overall sentiment
    const avgSentiment = memories.length > 0
      ? memories.reduce((sum, m) => sum + m.sentiment, 0) / memories.length
      : 0;

    // Key insights
    const positive = memories.filter(m => m.sentiment > 0);
    const negative = memories.filter(m => m.sentiment < 0);
    let insights = `You shared about ${relationship.contactName}. `;
    if (positive.length > 0) {
      insights += `You mentioned positive moments like "${positive[0].content}". `;
    }
    if (negative.length > 0) {
      insights += `You also talked about challenges, like "${negative[0].content}". `;
    }

    // Actionable suggestion
    const suggestion = negative.length > 0
      ? `Try discussing "${negative[0].content}" openly with ${relationship.contactName} to clear things up.`
      : `Keep nurturing your bond with ${relationship.contactName} by sharing more moments like "${positive[0]?.content || "these"}".`;

    res.json({ summary: insights + suggestion });
  } catch (err) {
    res.status(500).json({ message: "Error fetching summary" });
  }
};