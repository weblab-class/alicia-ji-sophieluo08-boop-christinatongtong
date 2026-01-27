const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    gridSize: {
        type: Number,
        required: true,
        min: 3,
        max: 5,
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true,
    },
    // keys are indices, values are color names
    correctPattern: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    // user submitted pattern
    userPattern: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    // color bank for difficulty level
    colorBank: {
        type: [String],
        required: true,
    },
    // time limit in sec (memorization time)
    timeLimit: {
        type: Number,
        required: true,
    },
    // play/fill time limit in sec
    playTimeLimit: {
        type: Number,
        default: 15,
    },
    // time taken by user to complete recoloring
    timeTaken: {
        type: Number,
        default: null,
    },
    // score
    score: {
        type: Number,
        default: null,
    },
    // accuracy percentage
    accuracy: {
        type: Number,
        default: null,
    },
    // game status
    status: {
        type: String,
        enum: ["active", "completed", "abandoned"],
        default: "active",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("game", GameSchema);
