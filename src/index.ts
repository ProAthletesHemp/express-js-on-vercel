import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai"; // fine if unused for now

const app = express();
app.use(bodyParser.json());

// Simple health check
app.get("/", (req, res) => {
  res.send("Matrix Edge stub running");
});

// ---------- MATRIX EDGE MAIN ENDPOINT ----------
app.post("/matrix-edge-test", async (req, res) => {
  try {
    const echoPayload = (req.body || {}) as any;
    const homeTeam = echoPayload.home_team;

    const result = {
      note: "Response from Matrix Edge — via Vercel stub",
      received: echoPayload,
      matrix_hot_take: homeTeam
        ? `TEST: Vercel says home_team is "${homeTeam}".`
        : "TEST: Vercel did not receive home_team.",
      spread_analysis: "",
      total_analysis: "",
      moneyline_analysis: "",
    };

    res.json(result);
  } catch (err: any) {
    console.error("matrix-edge-test error", err);
    res
      .status(500)
      .json({ error: "server_error", message: err?.message || "Unknown error" });
  }
});

export default app;
