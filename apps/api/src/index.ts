import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
