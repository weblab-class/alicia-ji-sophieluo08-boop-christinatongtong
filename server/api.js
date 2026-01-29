/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Game = require("./models/game");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// get color bank based on difficulty and mode
// Randomly selects colors from the available color pool
// For drawing mode: uses 3-4 colors (randomly between 3 and 4)
// For grid mode: uses difficulty-based color counts
function getColorBank(difficulty, mode = "grid") {
  // All available colors from COLOR_MAP
  const allColors = ["red", "blue", "yellow", "green", "purple", "orange"];

  let count;

  if (mode === "drawing") {
    // For drawings, randomly select 3 or 4 colors
    count = Math.floor(Math.random() * 2) + 3; // Randomly 3 or 4
  } else {
    // For grid mode, use difficulty-based counts
    const colorCounts = {
      easy: 2,
      medium: 3,
      hard: 4,
    };
    count = colorCounts[difficulty] || 3;
  }

  // Randomly shuffle and select the required number of colors
  const shuffled = [...allColors].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// generate random pattern of colored squares
// ex: { 0: "red", 1: "blue", 2: "green", ... }
// colorBank parameter ensures the pattern uses the same colors as the stored colorBank
function generatePattern(gridSize, difficulty, colorBank = null) {
  const totalSquares = gridSize * gridSize;
  // Use provided colorBank or generate a new one
  const bank = colorBank || getColorBank(difficulty);

  const pattern = {};
  for (let i = 0; i < totalSquares; i++) {
    // randomly select a color from the color bank for each square
    const randomColor = bank[Math.floor(Math.random() * bank.length)];
    pattern[i.toString()] = randomColor;
  }

  return pattern;
}

// get memorization time limit based on difficulty
function getTimeLimit(difficulty) {
  const limits = {
    easy: 20,
    medium: 20,
    hard: 30,
  };
  return limits[difficulty] || 15;
}

// get play/fill time limit based on difficulty
function getPlayTimeLimit(difficulty) {
  const limits = {
    easy: 15,
    medium: 30,
    hard: 40,
  };
  return limits[difficulty] || 15;
}

// Grid: when mult=1 (use all time), score = accuracy (0-100). When mult=2, score scales to MAX.
const MAX_SCORE_GRID = { easy: 300, medium: 600, hard: 900 };
const M_MAX = 2.0;   // max time multiplier (finishing at t=0 gives mult = 2)
const TIME_CURVE_P = 0.75;  // p < 1 = more lenient: multiplier stays higher as you use time

// calculate score and accuracy
// correctPattern and userPattern are objects: { "0": "red", "1": "blue", ... }
// timeLimit = play time limit for the level (T in the formula)
function calculateScore(correctPattern, userPattern, timeTaken, timeLimit, difficulty, mode) {
  const n = Object.keys(correctPattern).length;

  let perfectMatches = 0;
  let wrongMatches = 0;

  Object.keys(correctPattern).forEach((index) => {
    if (userPattern[index] === correctPattern[index]) {
      perfectMatches++;
    } else {
      wrongMatches++;
    }
  });

  const c = perfectMatches;
  const userSquares = Object.keys(userPattern).length;
  const missingSquares = n - userSquares;

  let adjustedAccuracy;

  if (mode === "drawing") {
    adjustedAccuracy = userSquares === 0 ? 0 : (perfectMatches / userSquares) * 100;
  } else {
    const accuracy = n > 0 ? (perfectMatches / n) * 100 : 0;
    const missingPenalty = (missingSquares / n) * 100;
    adjustedAccuracy = Math.max(0, accuracy - missingPenalty);
  }

  let score;

  if (mode === "grid") {
    // Base = accuracy (0-100). mult=1 → score = accuracy; mult=2 → score scales to MAX per difficulty.
    const MAX = MAX_SCORE_GRID[difficulty] ?? 300;
    const T = Math.max(Number(timeLimit), 1);
    const t = Math.max(0, Number(timeTaken));

    const r = Math.max(0, Math.min(1, (T - t) / T));
    const mult = 1 + (M_MAX - 1) * Math.pow(r, TIME_CURVE_P);
    const scale = 1 + (mult - 1) * (MAX / 100 - 1);  // 1 at mult=1, MAX/100 at mult=2
    const accuracyBase = n > 0 ? (c / n) * 100 : 0;
    score = Math.round(accuracyBase * scale);
  } else {
    // Drawing: max score 300. Time multiplier uses full span (r = time remaining fraction).
    const MAX_DRAWING_SCORE = 300;
    const T = Math.max(Number(timeLimit), 1);
    const t = Math.max(0, Number(timeTaken));
    const r = Math.max(0, Math.min(1, (T - t) / T));
    const timeMult = 0.5 + 0.5 * r;  // 0.5 when used all time, 1.0 when instant
    score = Math.round((adjustedAccuracy / 100) * MAX_DRAWING_SCORE * timeMult);
    score = Math.min(MAX_DRAWING_SCORE, score);
  }

  return {
    score,
    accuracy: Math.round(adjustedAccuracy * 10) / 10,
    perfectMatches,
    wrongMatches,
    missingSquares,
    totalSquares: n,
  };
}

// POST /api/game/create
// create a new game
router.post("/game/create", auth.ensureLoggedIn, (req, res) => {
  const { gridSize, difficulty, mode } = req.body;

  // Validate input
  if (!["grid", "drawing"].includes(mode)) {
    return res.status(400).send({ err: "mode must be grid or drawing" });
  }

  if (!gridSize || !difficulty) {
    return res.status(400).send({ err: "gridSize and difficulty are required" });
  }

  if (![3, 4, 5].includes(gridSize)) {
    return res.status(400).send({ err: "gridSize must be 3, 4, or 5" });
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return res.status(400).send({ err: "difficulty must be easy, medium, or hard" });
  }

  // Use mode from request, default to "grid" if not provided
  const gameMode = mode || "grid";

  // generate colorBank first, then use it for pattern generation
  const colorBank = getColorBank(difficulty, gameMode);
  const correctPattern = generatePattern(gridSize, difficulty, colorBank);
  const timeLimit = getTimeLimit(difficulty);
  const playTimeLimit = getPlayTimeLimit(difficulty);

  // create game in database
  const game = new Game({
    userId: req.user._id,
    mode,
    gridSize,
    difficulty,
    correctPattern,
    colorBank,
    timeLimit,
    playTimeLimit,
    status: "active",
  });

  game
    .save()
    .then((savedGame) => {
      // return game info (including pattern since users need to see it during memorization)
      res.send({
        gameId: savedGame._id,
        mode: savedGame.mode,
        gridSize: savedGame.gridSize,
        difficulty: savedGame.difficulty,
        timeLimit: savedGame.timeLimit,
        playTimeLimit: savedGame.playTimeLimit || getPlayTimeLimit(difficulty),
        colorBank: savedGame.colorBank,
        correctPattern: savedGame.correctPattern, // Users need this to memorize
      });
    })
    .catch((err) => {
      res.status(500).send({ err: "Failed to create game" });
    });
});

// POST /api/game/submit
// submit user's answer
router.post("/game/submit", auth.ensureLoggedIn, (req, res) => {
  const { gameId, userPattern, timeTaken } = req.body;

  // check input
  if (!gameId || typeof userPattern !== "object" || Array.isArray(userPattern)) {
    return res.status(400).send({ err: "gameId and userPattern object are required" });
  }

  if (timeTaken === undefined || timeTaken < 0) {
    return res.status(400).send({ err: "timeTaken must be a non-negative number" });
  }

  // find the game
  Game.findOne({ _id: gameId, userId: req.user._id })
    .then((game) => {
      if (!game) {
        return res.status(404).send({ err: "Game not found" });
      }

      if (game.status !== "active") {
        return res.status(400).send({ err: "Game is not active" });
      }

      // calculate score
      const result = calculateScore(
        game.correctPattern,
        userPattern,
        timeTaken,
        game.playTimeLimit,
        game.difficulty,
        game.mode
      );

      // update game with results
      game.userPattern = userPattern;
      game.timeTaken = timeTaken;
      game.score = result.score;
      game.accuracy = result.accuracy;
      game.status = "completed";

      return game.save();
    })
    .then((game) => {
      // update user statistics
      return User.findById(req.user._id).then((user) => {
        user.gamesPlayed += 1;

        if (game.mode === "grid") {
          if (game.score > (user.bestGridScore ?? 0)) user.bestGridScore = game.score;
          // optional: keep old field in sync
          if (game.score > (user.bestScore ?? 0)) user.bestScore = game.score;
        } else if (game.mode === "drawing") {
          if (game.score > (user.bestDrawingAccuracy ?? 0)) user.bestDrawingAccuracy = game.score;
        }

        // calculate new average accuracy
        // get all completed games for this user
        return Game.find({ userId: user._id, status: "completed" })
          .then((allGames) => {
            if (allGames.length > 0) {
              const totalAccuracy = allGames.reduce((sum, g) => sum + g.accuracy, 0);
              user.averageAccuracy = Math.round((totalAccuracy / allGames.length) * 10) / 10;
            }
            return user.save();
          });
      });
    })
    .then(() => {

      return Game.findById(gameId);
    })
    .then((game) => {
      res.send({
        gameId: game._id,
        mode: game.mode,
        score: game.score,
        accuracy: game.accuracy,
        correctPattern: game.correctPattern,
        userPattern: game.userPattern,
        timeTaken: game.timeTaken,
        timeLimit: game.timeLimit,
        colorBank: game.colorBank,
      });
    })
    .catch((err) => {
      res.status(500).send({ err: "Failed to submit game" });
    });
});

// GET /api/game/:gameId
// get game details
router.get("/game/:gameId", auth.ensureLoggedIn, (req, res) => {
  Game.findOne({ _id: req.params.gameId, userId: req.user._id })
    .then((game) => {
      if (!game) {
        return res.status(404).send({ err: "Game not found" });
      }

      res.send({
        gameId: game._id,
        mode: game.mode,
        gridSize: game.gridSize,
        difficulty: game.difficulty,
        status: game.status,
        score: game.score,
        accuracy: game.accuracy,
        timeTaken: game.timeTaken,
        timeLimit: game.timeLimit,
        colorBank: game.colorBank,
        correctPattern: game.status === "completed" ? game.correctPattern : null,
        userPattern: game.status === "completed" ? game.userPattern : null,
      });
    })
    .catch((err) => {
      res.status(500).send({ err: "Failed to fetch game" });
    });
});

// GET /api/stats/leaderboard
// get top scores
router.get("/stats/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const mode = req.query.mode || "grid"; // "grid" | "drawing"

    const match = { status: "completed", mode };

    const sort = { score: -1, createdAt: 1 };

    const rows = await Game.aggregate([
      { $match: match },
      { $sort: sort },

      // Keep ONLY the best result per user
      {
        $group: {
          _id: "$userId",
          gameId: { $first: "$_id" },
          score: { $first: "$score" },
          accuracy: { $first: "$accuracy" },
          timeTaken: { $first: "$timeTaken" },
          gridSize: { $first: "$gridSize" },
          difficulty: { $first: "$difficulty" },
          createdAt: { $first: "$createdAt" },
          mode: { $first: "$mode" },
        },
      },

      // Optional: re-sort after grouping, then take top N users
      { $sort: sort },
      { $limit: limit },

      // Join user name
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 0,
          userId: "$_id",
          userName: { $ifNull: ["$user.name", "Anonymous"] },
          gameId: 1,
          score: 1,
          accuracy: 1,
          timeTaken: 1,
          gridSize: 1,
          difficulty: 1,
          createdAt: 1,
          mode: 1,
        },
      },
    ]);

    res.send(rows);
  } catch (err) {
    res.status(500).send({ err: "Failed to fetch leaderboard" });
  }
});


// GET /api/stats/user/:userId
// get user stats
router.get("/stats/user/:userId", (req, res) => {
  const userId = req.params.userId;

  if (req.user && req.user._id.toString() !== userId) {
    return res.status(403).send({ err: "Can only view own stats" });
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ err: "User not found" });
      }

      return Game.find({ userId: userId, status: "completed" })
        .sort({ createdAt: -1 })
        .limit(10)
        .then((recentGames) => {
          res.send({
            userId: user._id,
            userName: user.name,
            gamesPlayed: user.gamesPlayed,
            bestScore: user.bestScore,
            bestGridScore: user.bestGridScore ?? 0,
            bestDrawingAccuracy: user.bestDrawingAccuracy ?? 0,
            bestDrawingScore: user.bestDrawingAccuracy ?? 0, // same as bestDrawingAccuracy (stored score 0–300)
            averageAccuracy: user.averageAccuracy,
            recentGames: recentGames.map((game) => ({
              gameId: game._id,
              score: game.score,
              accuracy: game.accuracy,
              gridSize: game.gridSize,
              difficulty: game.difficulty,
              timeTaken: game.timeTaken,
              createdAt: game.createdAt,
            })),
          });
        });
    })
    .catch((err) => {
      res.status(500).send({ err: "Failed to fetch user stats" });
    });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
