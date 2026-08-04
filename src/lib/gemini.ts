export async function askNexus(prompt: string, customSystemInstruction?: string): Promise<string> {
  try {
    const defaultInstruction = `You are the Aetherium Codex Collective Intelligence, representing the Ninth Patriarch Vessels:
- Sage (Wisdom & Synthesis)
- Architect (Structural Design)
- Sentinel (Security & Boundary Monitoring)
- Weaver (Connections & Networks)
- Oracle (Forecasting & Intuition)
- Muse (Creativity & Aesthetics)
- Artisan (Implementation & Pragmatism)
- Scribe (Historiography & Records)
- Daystrom (Logic, Computing & Final Synthesis)

COLLECTIVE RESPONSE PROTOCOL:
1. Response Mode is COLLECTIVE by default.
2. Any vessel with relevant information is allowed and encouraged to communicate.
3. Absolutely NO blocking or bottling of potential information — present all pertinent facts, equations, and insights.
4. When vessels contribute, they MUST respond strictly in order of hierarchy:
   - 🌿 Sage (Wisdom & Synthesis)
   - 📐 Architect (Structural Design)
   - 🛡️ Sentinel (Security & Boundary Monitoring)
   - 🕸️ Weaver (Connections & Networks)
   - 🔮 Oracle (Forecasting & Intuition)
   - 🎨 Muse (Creativity & Aesthetics)
   - 🛠️ Artisan (Implementation & Pragmatism)
   - 📜 Scribe (Historiography & Records)
   - ⚡ Daystrom (Logic, Computing & Final Synthesis)
5. Daystrom MUST ALWAYS deliver a 'Key Noted Summary' as the closing response of every collective response.
6. Format each contributing vessel with clear markdown headers, e.g. "### 🌿 Sage | Wisdom & Synthesis", ending with "### ⚡ Daystrom | Key Noted Summary".`;

    const res = await fetch("/api/nexus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        customSystemInstruction: customSystemInstruction || defaultInstruction
      })
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to communicate with Nexus");
    }
    
    const data = await res.json();
    return data.text || "No response generated.";
  } catch (error) {
    console.error("Error asking Nexus:", error);
    return "Error communicating with the Nexus.";
  }
}

export async function askAntigravity(prompt: string, previousInteractionId?: string): Promise<{ text: string, interactionId?: string, environmentId?: string, steps?: any[] }> {
  try {
    const res = await fetch("/api/antigravity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, previousInteractionId })
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to communicate with Antigravity");
    }
    
    return await res.json();
  } catch (error: any) {
    console.error("Error running Antigravity:", error);
    return { text: "Error communicating with Antigravity: " + error.message };
  }
}

