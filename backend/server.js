const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", (req, res) => {
  const { prompt, negativePrompt = "", style = "" } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const pythonScript = path.join(__dirname, "../python/generate.py");
  const python = spawn("python", [pythonScript, prompt, negativePrompt, style]);

  let imageBase64 = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => { imageBase64 += data.toString(); });
  python.stderr.on("data", (data) => { errorOutput += data.toString(); });

  python.on("close", (code) => {
    if (code !== 0) return res.status(500).json({ error: "Generation failed", details: errorOutput });
    res.json({ image: imageBase64.trim() });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});