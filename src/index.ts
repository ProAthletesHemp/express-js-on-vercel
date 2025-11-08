import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// Cast to any so TypeScript is happy; at runtime this *is* constructable.
const client = new (OpenAI as any)({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper: pull the "game payload" out of Bubble’s body
function getGamePayload(body: any) {
  if (!body) return null;

  // Case 1: old shape { model, input: "<json string>" }
  if (typeof body.input === "string") {
    try {
      return JSON.parse(body.input);
    } catch {
      return null;
    }
  }

  // Case 2: already an object with league / game fields
  if (body.league || body.game_id) return body;

  // Fallback
  return null;
}

// Simple GET sanity check (still available)
app.get("/matrix-edge-test", (_req, res) => {
  res.json({
    note: "Hello from Matrix Edge – Test (GET V2)",
    received: null,
  });
});

// MAIN: Bubble → OpenAI → Bubble
app.post("/matrix-edge-test", async (req, res) => {
  const body = req.body || {};

  const payload =
    getGamePayload(body) ?? {
      league: body.league ?? "UNKNOWN",
      msg: body.msg ?? null,
    };

  try {
    const response = await client.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content:
            "You are the Matrix AI Edge NFL Analysis Agent. " +
            "You receive ONE game's JSON payload from Bubble and must return ONLY JSON, " +
            "with this exact shape: " +
            "{ \"matrix_hot_take\": string, \"spread_analysis\": string, \"total_analysis\": string, \"moneyline_analysis\": string }. " +
            "Each field is 2–4 sentences, Vegas-style, confident and concise. " +
            "Do NOT include any extra keys, no explanation, no markdown, no backticks.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Here is the game payload as JSON:\n" +
                JSON.stringify(payload),
            },
          ],
        },
      ],
    });

    // Extract the model text output safely
    const firstMessage: any = response.output[0];
    const textPart =
      firstMessage?.content?.find((c: any) => c.type === "output_text") ??
      firstMessage?.content?.[0];

    const outputText: string = textPart?.text ?? "";

    let parsed: any;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      // If the model doesn't return valid JSON, fall back to stuffing text into hot_take
      parsed = {
        matrix_hot_take: outputText,
        spread_analysis: "",
        total_analysis: "",
        moneyline_analysis: "",
      };
    }

    res.json({
      note: "Response from Matrix Edge — via OpenAI",
      received: payload,
      matrix_hot_take: parsed.matrix_hot_take ?? "",
      spread_analysis: parsed.spread_analysis ?? "",
      total_analysis: parsed.total_analysis ?? "",
      moneyline_analysis: parsed.moneyline_analysis ?? "",
    });
  } catch (err) {
    console.error("OpenAI error", err);
    res.status(500).json({
      note: "Error from Matrix Edge — via OpenAI",
      received: payload,
      matrix_hot_take: "",
      spread_analysis: "",
      total_analysis: "",
      moneyline_analysis: "",
    });
  }
});

export default app;
