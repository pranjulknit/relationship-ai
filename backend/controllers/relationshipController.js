const Relationship = require("../models/Relationship");
const User = require("../models/User");

exports.addRelationship = async (req, res) => {
  const { contactName, userId } = req.body;
  try {
    const relationship = new Relationship({ userId, contactName, memories: [] });
    await relationship.save();
    await User.updateOne({ _id: userId }, { $push: { relationships: relationship._id } });
    res.json({ relationshipId: relationship._id });
  } catch (err) {
    res.status(500).json({ message: "Error adding relationship" });
  }
};