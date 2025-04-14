const express = require("express");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const relationshipRoutes = require("./routes/relationships");
const sessionRoutes = require("./routes/session");
const setupVoiceSocket = require("./sockets/voiceSocket");

dotenv.config();
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  next();
});

app.use("/auth", authRoutes);
app.use("/relationships", relationshipRoutes);
app.use("/sessions", sessionRoutes);

connectDB();

const server = app.listen(5000, () => console.log("Server running on port 5000"));
const io = new Server(server, { cors: { origin: "*" } });
setupVoiceSocket(io);