import { useState, useEffect } from "react";

const VoiceSession = ({ token, relationshipId, setSummary }) => {
  const [sessionId, setSessionId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [recorder, setRecorder] = useState(null);
  const [loading, setLoading] = useState(false);
  const socket = window.socket;

  const startSession = async () => {
    alert("I’m here to help you reflect, but for serious concerns, a counselor might be best.");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: JSON.parse(atob(token.split(".")[1])).id,
          relationshipId,
        }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setPrompt(data.prompt);
      new Audio(`data:audio/mp3;base64,${data.audio}`).play();
    } catch (err) {
        console.log(err);
      alert("Failed to start session.");
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/webm;codecs=opus";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      const audioChunks = [];
      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result.split(",")[1];
          socket.emit("voiceInput", { sessionId, audio: base64Audio });
        };
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
    } catch (err) {
        console.log(err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      setRecorder(null);
    }
  };

  useEffect(() => {
    socket.on("response", async ({ prompt, audio }) => {
      setPrompt(prompt);
      if (audio) {
        new Audio(`data:audio/mp3;base64,${audio}`).play();
      }

      if (prompt.includes("Session complete")) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/sessions/${sessionId}/summary`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          setSummary(data.summary);
        } catch (err) {
            console.log(err);
          alert("Failed to fetch session summary.");
        }
      }
    });

    socket.on("error", ({ message }) => alert(message));

    return () => {
      socket.off("response");
      socket.off("error");
    };
  }, [sessionId, token, setSummary]);

  return (
    <div>
      {sessionId ? (
        <div>
          <p>{prompt}</p>
          {recorder ? (
            <button onClick={stopRecording}>🛑 Stop Recording</button>
          ) : (
            <button onClick={startRecording}>🎙️ Record Response</button>
          )}
        </div>
      ) : (
        <button onClick={startSession} disabled={loading}>
          {loading ? "Starting..." : "Start Session"}
        </button>
      )}
    </div>
  );
};

export default VoiceSession;
