import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";

const client = new (OpenAI as any)({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// Make sure we can read JSON from Bubble
app.use(bodyParser.json());

// Simple health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ---------- MATRIX EDGE MAIN ENDPOINT ----------
// Bubble is POSTing the full game payload here.
app.post("/bubble-matrix", async (req, res) => {
  try {
    // For now, ignore whatever Bubble sends and just return a fixed test object.
    const echoPayload = {
      league: "NFL",
      msg: "ping from Bubble (hardcoded test)"
    };

    const result = {
      note: "Response from Matrix Edge — via Vercel stub",
      received: echoPayload,
      matrix_hot_take: "",
      spread_analysis: "",
      total_analysis: "",
      moneyline_analysis: ""
    };

    res.json(result);
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ error: "server_error", message: err?.message || "Unknown error" });
  }
});

  // Try to detect league from payload
  const league = (payload.league || payload.LEAGUE || "").toString().toUpperCase();

  // ---- SYSTEM PROMPTS (shortened on purpose for now) ----
  const commonOutputFormat = `
You must respond ONLY with a valid JSON object, no text before or after.

Required JSON keys:
- "matrix_hot_take": string
- "matrix_spread_analysis": string
- "matrix_total_analysis": string
- "matrix_moneyline_analysis": string

Do not include any other keys.
Each value must be plain text, no markdown.
`;

  const nflPrompt = `
You are the NFL Analysis Agent for Matrix AI Edge.

Voice:
- Confident, witty, Vegas-style odds analyst.
- Short, direct sentences. No corporate tone.

Input:
- You receive one game's normalized JSON payload from Bubble.
- It includes identity (league, game_id, home_team, away_team) and all spread/total/moneyline fields.

Task:
- Explain what the numbers mean like a professional odds-maker.
- Do NOT restate every raw number; focus on meaning, movement, and context.
- DO NOT give betting advice or picks.
- DO NOT output sources or URLs.

Sections you must produce (in JSON, see format spec below):
1) matrix_hot_take
   - Fun, sharp, slightly sarcastic roast of the matchup.
   - Use facts from the payload (lines, movement, records if present).
   - No slurs, no politics. Light profanity like "hell, damn, crap, shit" is allowed.
   - Keep under ~200 words.

2) matrix_spread_analysis
   - 2–4 sentences on the spread block.
   - Explain open → current movement (toward favorite or underdog).
   - Tie in win% / ROI if present.
   - Use "limited / moderate / solid sample" language if sample size is included.

3) matrix_total_analysis
   - 2–4 sentences on the total block.
   - Explain how total movement changes expected scoring (toward Over or Under).
   - Mention ROI changes if present.

4) matrix_moneyline_analysis
   - 2–4 sentences on the moneyline block.
   - Explain favorite/underdog, price movement, and whether value improved or eroded.

Output rules:
${commonOutputFormat}
`;

  const ncaafPrompt = `
You are the NCAAF College Football Analysis Agent for Matrix AI Edge.

Voice:
- Same Vegas-style tone: confident, witty, slightly roasted.
- Short, direct sentences.

Input:
- You receive one game's normalized JSON payload from Bubble.
- It includes identity (league, game_id, home_team, away_team) and all spread/total/moneyline fields.

Task:
- Interpret the numbers in odds-maker style.
- Do NOT restate tables; tell the story behind the numbers.
- No picks, no betting advice.

Sections (same as NFL):
1) matrix_hot_take  – college-football flavored roast of the matchup.
2) matrix_spread_analysis – 2–4 sentences on spread movement and win%/ROI.
3) matrix_total_analysis – 2–4 sentences on total and scoring expectations.
4) matrix_moneyline_analysis – 2–4 sentences on moneyline and price drift.

Output rules:
${commonOutputFormat}
`;

  // Fallback if league missing/unknown
  const genericPrompt = `
You are Matrix Edge test agent.

You receive a JSON object (Bubble payload about a game).
If you can detect "league" and it is "NFL" or "NCAAF", behave like the correct agent.
If not, just write generic football analysis.

Output rules:
${commonOutputFormat}
`;

  const systemPrompt =
    league === "NFL" ? nflPrompt :
    league === "NCAAF" ? ncaafPrompt :
    genericPrompt;

  try {
    const response = await client.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          // Send the raw Bubble payload as JSON string
          content: JSON.stringify(payload),
        },
      ],
      // NOTE: for now, we are NOT using tools here.
      // Once this plumbing is working end-to-end, we can add file_search + web_search.
    });

    // Grab the model's raw text output
    const contentItem = response.output[0]?.content[0];
    const aiText =
      typeof contentItem === "object" && "text" in contentItem
        ? (contentItem as any).text
        : String(contentItem ?? "");

    let parsed: any;
    try {
      parsed = JSON.parse(aiText);
    } catch (err) {
      console.error("Failed to parse AI JSON:", err, "raw:", aiText);
      return res.status(500).json({
        error: "parse_failed",
        message: "AI did not return valid JSON",
        raw: aiText,
      });
    }

    // At this point, parsed should look like:
    // {
    //   matrix_hot_take: "...",
    //   matrix_spread_analysis: "...",
    //   matrix_total_analysis: "...",
    //   matrix_moneyline_analysis: "..."
    // }

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error("Error calling OpenAI:", err);
    return res.status(500).json({
      error: "openai_error",
      message: err?.message || "Unknown error",
    });
  }
});

// Vercel uses the default export
export default app;
