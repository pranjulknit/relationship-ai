const speech = require("@google-cloud/speech");
const textToSpeech = require("@google-cloud/text-to-speech");
const Session = require("../models/Session");
const Relationship = require("../models/Relationship");
const prompts = require("../utils/prompts");

const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

module.exports = io => {
  io.on("connection", socket => {
    socket.on("voiceInput", async ({ sessionId, audio }) => {
      try {
        const session = await Session.findById(sessionId);
        if (!session) return socket.emit("error", { message: "Session not found" });
        const relationship = await Relationship.findById(session.relationshipId);

        // Transcribe
        const [speechResult] = await speechClient.recognize({
          audio: { content: audio },
          config: { encoding: "WEBM_OPUS", sampleRateHertz: 48000, languageCode: "en-US" }
        });
        const text = speechResult.results.map(r => r.alternatives[0].transcript).join("\n") || "Sorry, I didn’t catch that.";

        // Safety Check
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

        // Basic Sentiment
        const sentiment = /love|great|happy/i.test(text) ? 0.5 : /frustrated|hurt|sad/i.test(text) ? -0.5 : 0;

        // Save Memory
        await Relationship.updateOne(
          { _id: session.relationshipId },
          { $push: { memories: { type: session.phase, content: text, sentiment } } }
        );
        await Session.updateOne({ _id: sessionId }, { $set: { transcript: session.transcript + "\n" + text } });

        // Next Prompt
        let nextPhase = session.phase;
        let nextIndex = session.promptIndex + 1;
        if (nextIndex >= prompts[session.phase].length) {
          const phases = ["onboarding", "emotional", "dynamics", "dualLens"];
          nextPhase = phases[phases.indexOf(session.phase) + 1] || "done";
          nextIndex = 0;
        }
        await Session.updateOne({ _id: sessionId }, { phase: nextPhase, promptIndex: nextIndex });

        if (nextPhase === "done") {
          socket.emit("response", { prompt: "Thanks for sharing! Session complete.", audio: null });
          return;
        }

        const prompt = prompts[nextPhase][nextIndex].replace("{name}", relationship.contactName);
        const [ttsResult] = await ttsClient.synthesizeSpeech({
          input: { text: prompt },
          voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
          audioConfig: { audioEncoding: "MP3" }
        });
        socket.emit("response", { prompt, audio: ttsResult.audioContent.toString("base64") });
      } catch (err) {
        console.error(err);
        socket.emit("error", { message: "Something went wrong, please try again." });
      }
    });
  });
};