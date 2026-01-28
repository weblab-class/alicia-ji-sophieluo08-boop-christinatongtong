const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  email: String,
  // statistics
  gamesPlayed: {
    type: Number,
    default: 0,
  },
  bestScore: {
    type: Number,
    default: 0,
  },

  bestGridScore: { type: Number, default: 0 },

  bestDrawingAccuracy: { type: Number, default: 0 },

  averageAccuracy: {
    type: Number,
    default: 0,
  },
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
