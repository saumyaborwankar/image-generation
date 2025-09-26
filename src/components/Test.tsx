import React, { useState } from "react";
import { Heart, RefreshCw, Wand2 } from "lucide-react";

// ✅ Load API key from environment
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;

type GeneratedImage = {
  url: string;
  prompt: string;
  favorite: boolean;
};

export default function Test() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Helper: Convert base64 -> Blob
  function base64ToBlob(base64: string, type = "image/png") {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }

  // --- Generate images from prompt ---
  const generateImages = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          n: 4,
          size: "512x512",
          response_format: "b64_json",
        }),
      });

      const data = await res.json();
      if (!data.data) throw new Error(JSON.stringify(data));

      const newImages = data.data.map((img: any) => ({
        url: `data:image/png;base64,${img.b64_json}`,
        prompt,
        favorite: false,
      }));

      setImages((prev) => [...newImages, ...prev]);
    } catch (err) {
      console.error("Error generating images:", err);
    }
    setLoading(false);
  };

  // --- Toggle favorite ---
  const toggleFavorite = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, favorite: !img.favorite } : img
      )
    );
  };

  // --- Generate variation of an image ---
  const generateVariation = async (imageUrl: string, prompt: string) => {
    setLoading(true);
    try {
      const base64Data = imageUrl.split(",")[1]; // remove "data:image/png;base64,"
      const blob = base64ToBlob(base64Data);

      const formData = new FormData();
      formData.append("model", "gpt-image-1");
      formData.append("prompt", prompt);
      formData.append("image", blob, "image.png");
      formData.append("n", "2");
      formData.append("size", "512x512");
      formData.append("response_format", "b64_json");

      const res = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!data.data) throw new Error(JSON.stringify(data));

      const newImages = data.data.map((img: any) => ({
        url: `data:image/png;base64,${img.b64_json}`,
        prompt: `${prompt} (variation)`,
        favorite: false,
      }));

      setImages((prev) => [...newImages, ...prev]);
    } catch (err) {
      console.error("Error creating variation:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">AI Image Generator 🎨</h1>

      {/* Input Section */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Describe your image (e.g., a happy retriever puppy)..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={generateImages}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-white font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Generated Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <img
              src={img.url}
              alt={`Generated from: ${img.prompt}`}
              className="w-full h-64 object-cover"
            />
            <div className="p-2">
              <p className="text-xs text-gray-500 italic mb-2">{img.prompt}</p>

              <div className="flex justify-between">
                {/* Favorite Button */}
                <button onClick={() => toggleFavorite(idx)} className="p-1">
                  <Heart
                    className={`h-5 w-5 ${
                      img.favorite ? "text-red-500" : "text-gray-400"
                    }`}
                  />
                </button>

                {/* Variation Button */}
                <button
                  onClick={() => generateVariation(img.url, img.prompt)}
                  className="p-1"
                >
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() =>
                    generateVariation(img.url, `${img.prompt} with sunglasses`)
                  }
                  className="p-1"
                >
                  <Wand2 className="h-5 w-5 text-purple-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
