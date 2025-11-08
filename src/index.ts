import express from "express";

const app = express();
app.use(express.json());

// ✅ Simple test route for the relay
app.post("/matrix-edge-test", (req, res) => {
  res.json({
    note: "Hello from Matrix Edge – Test",
    received: req.body || null
  });
});

export default app;
