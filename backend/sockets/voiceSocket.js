const speech = require("@google-cloud/speech");
const textToSpeech = require("@google-cloud/text-to-speech");
const Session = require("../models/Session");
const Relationship = require("../models/Relationship");
const { generatePrompt, analyzeSentiment } = require("../utils/huggingface");

const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

module.exports = io => {
  io.on("connection", socket => {
    socket.on("voiceInput", async ({ sessionId, audio }) => {
      try {
        const session = await Session.findById(sessionId);
        if (!session) return socket.emit("error", { message: "Session not found" });
        const relationship = await Relationship.findById(session.relationshipId);
        if (!relationship) return socket.emit("error", { message: "Relationship not found" });

        // Transcribe audio
        const [speechResult] = await speechClient.recognize({
          audio: { content: audio },
          config: { encoding: "WEBM_OPUS", sampleRateHertz: 48000, languageCode: "en-US" }
        });
        const text = speechResult.results.map(r => r.alternatives[0].transcript).join("\n") || "Sorry, I didn’t catch that.";

        // Safety check
        if (/hurt|unsafe|depressed|yelled/i.test(text)) {
          const prompt = "That sounds heavy. Want to pause or keep going?";
          const [ttsResult] = await ttsClient.synthesizeSpeech({
            input: { text: prompt },
            voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
            audioConfig: { audioEncoding: "MP3" }
          });
          socket.emit("response", { prompt, audio: ttsResult.audioContent.toString("base64") });
          return;
        }

        // Analyze sentiment
        const sentiment = await analyzeSentiment(text);

        // Save user input
        await Relationship.updateOne(
          { _id: session.relationshipId },
          {
            $push: {
              memories: { type: session.phase, content: text, sentiment, isPrompt: false },
              sentimentTrends: {
                sessionId: session._id,
                avgSentiment: sentiment,
                timestamp: new Date()
              }
            }
          }
        );

        // Update session transcript
        await Session.updateOne(
          { _id: sessionId },
          { $set: { transcript: session.transcript + "\n" + text } }
        );

        // Get next prompt
        let nextPhase = session.phase;
        let nextIndex = session.promptIndex + 1;
        const phases = ["onboarding", "emotional", "dynamics", "dualLens"];
        if (nextIndex >= 2) {
          const currentIndex = phases.indexOf(session.phase);
          nextPhase = currentIndex + 1 < phases.length ? phases[currentIndex + 1] : "done";
          nextIndex = 0;
        }

        // Update session
        await Session.updateOne(
          { _id: sessionId },
          { phase: nextPhase, promptIndex: nextIndex }
        );

        if (nextPhase === "done") {
          socket.emit("response", { prompt: "Thanks for sharing! Session complete.", audio: null });
          return;
        }

        const prompt = await generatePrompt(nextPhase, relationship.contactName, relationship.memories, sentiment);
        console.log("Sending prompt:", prompt);

        // Save prompt
        await Relationship.updateOne(
          { _id: session.relationshipId },
          {
            $push: {
              memories: { type: nextPhase, content: prompt, sentiment: 0, isPrompt: true }
            }
          }
        );

        const [ttsResult] = await ttsClient.synthesizeSpeech({
          input: { text: prompt },
          voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
          audioConfig: { audioEncoding: "MP3" }
        });

        socket.emit("response", { prompt, audio: ttsResult.audioContent.toString("base64") });
      } catch (err) {
        console.error("Socket error:", err);
        socket.emit("error", { message: "Something went wrong, please try again." });
      }
    });
  });
};