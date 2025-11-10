// index.ts
import express from "express";
import bodyParser from "body-parser";
import { runMatrixWorkflow } from "./matrixWorkflow.js";

const app = express();
app.use(bodyParser.json());

// Health check
app.get("/", (_req, res) => {
  res.send("Matrix Edge stub running");
});

// -------- MATRIX EDGE MAIN ENDPOINT --------
app.post("/matrix-edge-test", async (req, res) => {
  try {
    // Log exactly what Bubble sent
    console.log(
      "Matrix Edge Test payload:",
      JSON.stringify(req.body, null, 2)
    );

    // Call our "brain" with the full Bubble payload
    const analysis = await runMatrixWorkflow(req.body);

    // Return only the analysis object back to Bubble
    res.json(analysis);
  } catch (err: any) {
    console.error("Matrix Edge error:", err);
    res.status(500).json({
      error: "server_error",
      message: err?.message || "Unknown error",
    });
  }
});

export default app;
