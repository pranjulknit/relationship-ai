const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    relationshipId:{type:mongoose.Schema.Types.ObjectId,ref:"Relationship"},
    phase:{type:String,default:"onboarding"},
    promptIndex:{type:Number,default:0},
    transcript:[{type:String,default:""}],
})

module.exports = mongoose.model("Session",sessionSchema);

