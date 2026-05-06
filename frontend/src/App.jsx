import { useState } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, negativePrompt, style }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");
      const imgSrc = `data:image/png;base64,${data.image}`;
      setImage(imgSrc);
      setHistory((prev) => [{ prompt, imgSrc }, ...prev].slice(0, 6));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = image;
    link.download = `generated_${Date.now()}.png`;
    link.click();
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>AI Image Generator</h1>
      <p>Powered by Stable Diffusion XL</p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image you want to generate..."
        rows={3}
        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
      />

      <textarea
        value={negativePrompt}
        onChange={(e) => setNegativePrompt(e.target.value)}
        placeholder="Negative prompt (what to avoid, e.g. blurry, ugly, watermark)..."
        rows={2}
        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem", marginTop: "0.5rem" }}
      />

      <select
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem", marginTop: "0.5rem" }}
      >
        <option value="">No style</option>
        <option value="photorealistic">Photorealistic</option>
        <option value="anime">Anime</option>
        <option value="oil painting">Oil Painting</option>
        <option value="sketch">Sketch</option>
      </select>

      <button
        onClick={generateImage}
        disabled={loading || !prompt.trim()}
        style={{ marginTop: "0.5rem", padding: "0.5rem 1.5rem", fontSize: "1rem" }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {image && (
        <div style={{ marginTop: "1rem" }}>
          <img src={image} alt="Generated" style={{ maxWidth: "100%" }} />
          <br />
          <button onClick={downloadImage} style={{ marginTop: "0.5rem" }}>Download</button>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>History</h2>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {history.map((item, i) => (
              <div key={i} style={{ width: "150px" }}>
                <img src={item.imgSrc} alt={item.prompt} style={{ width: "100%" }} />
                <p style={{ fontSize: "0.75rem" }}>{item.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;