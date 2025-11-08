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
app.post("/matrix-edge-test", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          { role: "system", content: "You are a test agent responding from Matrix Edge Test Relay." },
          { role: "user", content: JSON.stringify(req.body || { msg: "ping from Bubble" }) }
        ]
      })
    });

    const data = await response.json();

    res.json({
      note: "Response from Matrix Edge – via OpenAI",
      received: req.body || null,
      openai_reply: data?.choices?.[0]?.message?.content || "No reply"
    });
  } catch (error) {
    res.status(500).json({ error: "OpenAI relay failed", details: error.message });
  }
});

export default app;
