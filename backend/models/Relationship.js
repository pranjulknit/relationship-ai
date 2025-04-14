const mongoose = require("mongoose");


const memorySchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., "onboarding"
    content: { type: String, required: true }, // e.g., "his man he is in my college"
    sentiment: { type: Number, required: true } // e.g., 0.5, -0.5, 0
  });
  
const relationshipSchema = new mongoose.Schema({
    userId: {type:mongoose.Schema.Types.ObjectId,ref:"User"},
    contactName:{type:String,required:true},
    memories:[memorySchema]
});

module.exports = mongoose.model("Relationship",relationshipSchema);