const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
  type: { type: String, required: true },
  content: { type: String, required: true },
  sentiment: { type: Number, required: true }
});

const relationshipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contactName: { type: String, required: true },
  memories: [memorySchema],
  sentimentTrends: [{ sessionId: mongoose.Schema.Types.ObjectId, avgSentiment: Number, timestamp: Date }]
});

module.exports = mongoose.model("Relationship", relationshipSchema);