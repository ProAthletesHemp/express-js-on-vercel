import express from "express";

const app = express();
app.use(express.json());

// GET for quick browser testing
app.get("/matrix-edge-test", (req, res) => {
  res.json({
    note: "Hello from Matrix Edge – Test (GET V2)",
    received: null
  });
});

// POST for Bubble / API calls
app.post("/matrix-edge-test", (req, res) => {
  res.json({
    note: "Hello from Matrix Edge – Test (POST)",
    received: req.body || null
  });
});

export default app;
