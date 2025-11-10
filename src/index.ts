import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai"; // fine if unused for now

const app = express();
app.use(bodyParser.json());

// Health check
app.get("/", (_req, res) => {
  res.send("Matrix Edge stub running");
});

// -------- MATRIX EDGE MAIN ENDPOINT --------
app.post("/matrix-edge-test", async (req, res) => {
  try {
    // 🔹 Add this line
    console.log(
      "Matrix Edge Test payload:",
      JSON.stringify(req.body, null, 2)
    );

    const { league, home_team } = req.body || {};
    const echoPayload = req.body; // whatever Bubble sent

    const result = {
      note: "Response from Matrix Edge — via Vercel stub",
      received: echoPayload,
      matrix_hot_take: home_team
        ? `TEST: Vercel says home_team is "${home_team}".`
        : "TEST: Vercel did not receive home_team.",
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
