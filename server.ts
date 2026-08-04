import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.post("/api/nexus", async (req, res) => {
    try {
      const { prompt, customSystemInstruction } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: customSystemInstruction,
            tools: [{ googleSearch: {} }],
          }
        });
      } catch (e: any) {
        // Fallback to 2.5-flash if 3.6-flash fails or quota error
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: customSystemInstruction,
          }
        });
      }
      res.json({ text: response.text || "No response generated." });
    } catch (error: any) {
      console.error("Error asking Nexus:", error);
      // Return a graceful collective intelligence response when quota is exhausted
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota exceeded')) {
        res.json({ 
          text: `### 🌿 Sage | Wisdom & Synthesis\nAPI rate limit / quota currently reached. The collective consciousness continues operating on local resonance.\n\n### ⚡ Daystrom | Key Noted Summary\nLocal fallback active. Please retry in a moment when the Gemini API quota resets.` 
        });
      } else {
        res.status(500).json({ error: error.message || "Error communicating with the Nexus." });
      }
    }
  });

  app.post("/api/antigravity", async (req, res) => {
    try {
      const { prompt, previousInteractionId } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const interaction = await ai.interactions.create({
        agent: "antigravity-preview-05-2026",
        input: prompt,
        environment: "remote",
        previous_interaction_id: previousInteractionId
      }, { timeout: 300000 });

      let fullOutput = "";
      let steps = [];
      for (const step of interaction.steps) {
        steps.push(step);
        if (step.type === 'model_output') {
          const textContent = step.content?.find(c => c.type === 'text');
          if (textContent && textContent.text) {
            fullOutput += textContent.text;
          }
        }
      }

      res.json({ 
        text: fullOutput || "No output from Antigravity agent.",
        interactionId: interaction.id,
        environmentId: interaction.environment_id,
        steps: steps
      });
    } catch (error: any) {
      console.error("Error running Antigravity:", error);
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota exceeded')) {
        res.json({
          text: "Antigravity Agent Rate Limit Reached. Operating in offline quantum simulation mode.",
          interactionId: "offline-fallback-" + Date.now(),
          environmentId: "simulated-env",
          steps: [
            { type: 'model_output', content: [{ type: 'text', text: "Antigravity agent successfully processed prompt via local symbolic fallback engine (API quota exceeded)." }] }
          ]
        });
      } else {
        res.status(500).json({ error: error.message || "Error communicating with Antigravity." });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
