import { useState } from "react";
import io from "socket.io-client";
import VoiceSession from "./components/VoiceSession";

window.socket = io(import.meta.env.VITE_API_URL);

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [contactName, setContactName] = useState("");
  const [relationshipId, setRelationshipId] = useState("");
  const [summary, setSummary] = useState("");

  const register = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    alert("Registered!");
  };

  const login = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    setToken(data.token);
  };

  const addRelationship = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/relationships`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ contactName, userId: JSON.parse(atob(token.split(".")[1])).id })
    });
    const data = await res.json();
    setRelationshipId(data.relationshipId);
  };

  return (
    <div className="container">
      {!token ? (
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={register}>Register</button>
          <button onClick={login}>Login</button>
        </div>
      ) : !relationshipId ? (
        <div>
          <input
            type="text"
            placeholder="Contact Name (e.g., Rahul)"
            value={contactName}
            onChange={e => setContactName(e.target.value)}
          />
          <button onClick={addRelationship}>Add Relationship</button>
        </div>
      ) : summary ? (
        <div>
          <p>{summary}</p>
          <button onClick={() => setSummary("")}>Start New Session</button>
        </div>
      ) : (
        <VoiceSession token={token} relationshipId={relationshipId} setSummary={setSummary} />
      )}
    </div>
  );
}

export default App;