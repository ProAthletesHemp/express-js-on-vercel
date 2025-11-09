import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai"; // we'll use this later, it's fine if it's unused for now

const app = express();
app.use(bodyParser.json());

// Simple health check (optional, but nice to have)
app.get("/", (req, res) => {
  res.send("Matrix Edge stub running");
});

// ---------- MATRIX EDGE MAIN ENDPOINT ----------
// Bubble will POST the full game payload here.
app.post("/bubble-matrix", async (req, res) => {
  try {
    // For now, ignore whatever Bubble sends and just return a fixed test object.
    const echoPayload = {
      league: "NFL",
      msg: "ping from Bubble (hardcoded test)",
      raw_body: req.body, // lets us see what Bubble actually sent
    };

    const result = {
      note: "Response from Matrix Edge — via Vercel stub",
      received: echoPayload,
      matrix_hot_take: "",
      spread_analysis: "",
      total_analysis: "",
      moneyline_analysis: "",
    };

    res.json(result);
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ error: "server_error", message: err?.message || "Unknown error" });
  }
});

export default app;
