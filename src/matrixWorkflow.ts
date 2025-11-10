// src/matrixWorkflow.ts
// This is the "brain" that Vercel calls.
// For now it's a stub: it just echoes the payload in a structured way.
// Later we'll replace this with the real Agents SDK logic.

export type MatrixAnalysisResult = {
  matrix_hot_take: string;
  spread_analysis: string;
  total_analysis: string;
  moneyline_analysis: string;
  sources?: string;
  version: string;
  // Optional: keep raw payload for debugging during setup
  received_payload?: any;
};

export async function runMatrixWorkflow(payload: any): Promise<MatrixAnalysisResult> {
  const home = payload?.home_team ?? "UNKNOWN_HOME";
  const away = payload?.away_team ?? "UNKNOWN_AWAY";
  const league = payload?.league ?? "UNKNOWN_LEAGUE";

  return {
    matrix_hot_take: `STUB: ${league} matchup — ${away} at ${home}. (from matrixWorkflow.ts)`,
    spread_analysis: "STUB: spread_analysis placeholder.",
    total_analysis: "STUB: total_analysis placeholder.",
    moneyline_analysis: "STUB: moneyline_analysis placeholder.",
    sources: "",
    version: "1.0.1",
    received_payload: payload,
  };
}
