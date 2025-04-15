const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
  type: { type: String, required: true },
  content: { type: String, required: true },
  sentiment: { type: Number, required: true },
  isPrompt: { type: Boolean, default: false }
});

const relationshipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contactName: { type: String, required: true },
  memories: [memorySchema],
  sentimentTrends: [{
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    avgSentiment: Number,
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model("Relationship", relationshipSchema);