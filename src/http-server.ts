import express from "express";

export function startHttpServer(port: number): void {
  const app = express();
  app.get("/health", (_req, res) => {
    res.json({ ok: true, name: "data-use-license-mcp", version: "0.1.0" });
  });
  app.listen(port, () => {
    console.error(`HTTP /health on :${port}`);
  });
}
