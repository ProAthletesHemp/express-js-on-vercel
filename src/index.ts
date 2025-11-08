import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// OpenAI client using your Vercel env var
// @ts-ignore – TS 4.9 doesn't like the OpenAI constructor type, but this is correct at runtime
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper: pull the “game payload” out of Bubble’s body
function getGamePayload(body: any) {
  if (!body) return null;

  // If Bubble sends { model, input: "<json string>" }
  if (typeof body.input === "string") {
    try {
      return JSON.parse(body.input);
    } catch {
      return { raw_input: body.input };
    }
  }

  // If Bubble someday sends { input: { ... } }
  if (body.input) return body.input;

  // Fallback: just use the whole body
  return body;
}

// Simple GET test – unchanged idea, just new note text
app.get("/matrix-edge-test", (_req, res) => {
  res.json({
    note: "Hello from Matrix Edge – Test (GET V2)",
    received: null,
  });
});

// Main POST endpoint Bubble calls
app.post("/matrix-edge-test", async (req, res) => {
  const gamePayload = getGamePayload(req.body);

  try {
    // Prompt: tell the model what to do and how to format output
    const prompt = `
You are the Matrix AI Edge Analysis Agent.

You receive ONE game's JSON payload from Bubble (below).
Write FOUR short sections:

1) matrix_hot_take  – spicy roast-style commentary (fun, sharp, but no slurs or politics).
2) spread_analysis   – 2–4 sentences, professional Vegas-style odds analysis of the spread.
3) total_analysis    – 2–4 sentences on the game total.
4) moneyline_analysis– 2–4 sentences on the moneyline.

FORMAT (IMPORTANT):
Return ONLY a JSON object with EXACTLY these string fields:

{
  "matrix_hot_take": "...",
  "spread_analysis": "...",
  "total_analysis": "...",
  "moneyline_analysis": "..."
}

No extra keys. No prose outside the JSON. No markdown.

Game payload:
${JSON.stringify(gamePayload, null, 2)}
    `.trim();

    // Call OpenAI Responses API
    const aiResponse = await client.responses.create({
      model: "gpt-5",
      input: prompt,
    });

    const textOutput =
      aiResponse.output?.[0]?.content?.[0]?.text ?? "";

    let analysis: any = {};

    // Try to parse the JSON the model returns
    try {
      analysis = JSON.parse(textOutput);
    } catch {
      // Fallback: if it didn't give valid JSON, stuff whole text in hot_take
      analysis = {
        matrix_hot_take: textOutput,
        spread_analysis: "",
        total_analysis: "",
        moneyline_analysis: "",
      };
    }

    res.json({
      // Keeps the old “note + received” behavior
      note: "Response from Matrix Edge – via OpenAI",
      received: gamePayload,

      // NEW: four direct fields Bubble can map to DB
      matrix_hot_take: analysis.matrix_hot_take ?? "",
      spread_analysis: analysis.spread_analysis ?? "",
      total_analysis: analysis.total_analysis ?? "",
      moneyline_analysis: analysis.moneyline_analysis ?? "",
    });
  } catch (err: any) {
    console.error("Matrix Edge relay error:", err);

    res.status(500).json({
      note: "Error from Matrix Edge – via OpenAI",
      error: err?.message ?? "Unknown error",
      received: gamePayload,
    });
  }
});

export default app;
