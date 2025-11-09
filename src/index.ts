import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai"; // kept for later, safe if unused for now

const app = express();
app.use(bodyParser.json());

// ---------- HEALTH CHECK ----------
app.get("/", (_req, res) => {
  res.send("Matrix Edge stub running");
});

// ---------- MATRIX EDGE TEST ENDPOINT ----------
app.post("/matrix-edge-test", async (req, res) => {
  try {
    const { bubble_home_team } = req.body as any;

    const result = {
      note: "Response from Matrix Edge — via Vercel stub",
      received: req.body,

      // *** THIS is what will show up in your popup + DB ***
      matrix_hot_take: bubble_home_team
        ? `TEST: Vercel says the home team is "${bubble_home_team}".`
        : "TEST: Vercel did not receive bubble_home_team.",

      spread_analysis: "",
      total_analysis: "",
      moneyline_analysis: "",
    };

    res.json(result);
  } catch (err: any) {
    console.error("Matrix Edge error:", err);
    res.status(500).json({
      error: "server_error",
      message: err?.message || "Unknown error",
    });
  }
});

// ---------- EXPORT ----------
export default app;
