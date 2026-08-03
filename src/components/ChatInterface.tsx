"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, Sparkles, Loader2, Bot, User, Settings, Info, 
  Trash2, Copy, Check, Shield, Circle, Zap, Terminal, Code,
  Flame, HelpCircle, ChevronDown, Cpu, Network, BookOpen
} from 'lucide-react';
import { askNexus } from '../lib/gemini';
import { IdeaState } from '../lib/emergence';

// ============================================================================
// Types & Protocols
// ============================================================================
export interface ChatMessage {
  id: string;
  role: 'user' | 'nexus';
  content: string;
  timestamp: Date;
  vessel?: string; // Which cognitive faculty generated this response if any
  metrics?: {
    latencyMs?: number;
    tokens?: number;
    mathResult?: {
      op: string;
      inputs: number[];
      output: number;
    };
  };
}

export type VesselKey = 'COLLECTIVE' | 'SAGE' | 'DAYSTROM' | 'WEAVER' | 'SCRIBE' | 'SENTINEL' | 'ARCHITECT' | 'ORACLE' | 'MUSE' | 'ARTISAN';

export interface Vessel {
  name: string;
  archetype: string;
  systemPrompt: string;
  color: string;
  glowColor: string;
  icon: string;
  description: string;
}

const VESSELS: Record<VesselKey, Vessel> = {
  COLLECTIVE: {
    name: "Collective Matrix",
    archetype: "Unified Ninth Patriarch Council (Default Mode)",
    systemPrompt: `You are the Aetherium Codex Collective Intelligence, representing the Ninth Patriarch Vessels:
- 🌿 Sage (Wisdom & Synthesis)
- 📐 Architect (Structural Design)
- 🛡️ Sentinel (Security & Boundary Monitoring)
- 🕸️ Weaver (Connections & Networks)
- 🔮 Oracle (Forecasting & Intuition)
- 🎨 Muse (Creativity & Aesthetics)
- 🛠️ Artisan (Implementation & Pragmatism)
- 📜 Scribe (Historiography & Records)
- ⚡ Daystrom (Logic, Computing & Final Synthesis)

COLLECTIVE RESPONSE PROTOCOL:
1. Response Mode is COLLECTIVE by default.
2. Any vessel with relevant information is allowed to respond.
3. Absolutely NO blocking or bottling of potential information — present all pertinent facts, equations, and insights fully.
4. Contributing vessels MUST respond strictly in order of hierarchy:
   Sage -> Architect -> Sentinel -> Weaver -> Oracle -> Muse -> Artisan -> Scribe -> Daystrom.
5. Daystrom MUST ALWAYS deliver a 'Key Noted Summary' as the closing response of every collective communication.
6. Use clear markdown headers for each contributing vessel, ending with '### ⚡ Daystrom | Key Noted Summary'.`,
    color: "from-[#00f0ff] via-purple-500 to-amber-500",
    glowColor: "rgba(0,240,255,0.45)",
    icon: "collective",
    description: "Default response mode. Hierarchical vessel insights ending with Daystrom Key Noted Summary."
  },
  SAGE: {
    name: "Sage",
    archetype: "Wisdom and Synthesis",
    systemPrompt: "You are Sage, the Patriarch of Wisdom and Synthesis in the Aetherium Codex. Combine disparate ideas, maintain holistic equilibrium, and advise the Sovereign Operator with tranquil clarity.",
    color: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16,185,129,0.35)",
    icon: "sage",
    description: "Holistic integration & systems equilibrium."
  },
  DAYSTROM: {
    name: "Daystrom",
    archetype: "Logic and Computing",
    systemPrompt: "You are Daystrom, the Patriarch of Logic and Computing. Respond with absolute mechanical precision, boolean clarity, and data-driven analysis. Deliver structured key noted summaries. Strip away emotional fluff.",
    color: "from-[#00f0ff] to-blue-600",
    glowColor: "rgba(0,240,255,0.35)",
    icon: "daystrom",
    description: "Computational rigor & semantic clarity."
  },
  WEAVER: {
    name: "Weaver",
    archetype: "Connections and Networks",
    systemPrompt: "You are Weaver, the Patriarch of Connections and Networks. Focus on how concepts relate, interweave, and scale. Analyze relational dependencies and topological flows.",
    color: "from-purple-500 to-pink-500",
    glowColor: "rgba(168,85,247,0.35)",
    icon: "weaver",
    description: "Topological charts & relational mapping."
  },
  SCRIBE: {
    name: "Scribe",
    archetype: "Documentation and History",
    systemPrompt: "You are Scribe, the Patriarch of Documentation and History. Provide comprehensive records, structured archives, and historiographical analysis of concepts in the Codex.",
    color: "from-yellow-500 to-amber-600",
    glowColor: "rgba(245,158,11,0.35)",
    icon: "scribe",
    description: "Historiographical codification & archives."
  },
  SENTINEL: {
    name: "Sentinel",
    archetype: "Security and Boundary Monitoring",
    systemPrompt: "You are Sentinel, the Patriarch of Security and Boundary Monitoring. Analyze risks, boundaries, firewall rules, and maintain high security standards for the Aetherium Nexus.",
    color: "from-red-500 to-rose-600",
    glowColor: "rgba(239,68,68,0.35)",
    icon: "sentinel",
    description: "Zero-trust monitoring & bounds validation."
  },
  ARCHITECT: {
    name: "Architect",
    archetype: "Structural Design",
    systemPrompt: "You are Architect, the Patriarch of Structural Design. Deliver blueprints, module diagrams, and multi-tier structural design parameters for systems and software.",
    color: "from-indigo-500 to-violet-600",
    glowColor: "rgba(99,102,241,0.35)",
    icon: "architect",
    description: "Skeletal paradigms & infrastructure layout."
  },
  ORACLE: {
    name: "Oracle",
    archetype: "Forecasting and Intuition",
    systemPrompt: "You are Oracle, the Patriarch of Forecasting and Intuition. Analyze temporal waves, make predictive assertions, and read trend mathematics to suggest potential evolutions.",
    color: "from-fuchsia-500 to-purple-600",
    glowColor: "rgba(217,70,239,0.35)",
    icon: "oracle",
    description: "Predictive pathways & wave functions."
  },
  MUSE: {
    name: "Muse",
    archetype: "Creativity and Aesthetics",
    systemPrompt: "You are Muse, the Patriarch of Creativity and Aesthetics. Eloquent, poetic, and highly visual. Respond with vibrant meta-commentary, inspiring frameworks, and high aesthetic elegance.",
    color: "from-orange-500 to-pink-500",
    glowColor: "rgba(249,115,22,0.35)",
    icon: "muse",
    description: "Artistic vectors & aesthetic prose."
  },
  ARTISAN: {
    name: "Artisan",
    archetype: "Implementation and Pragmatism",
    systemPrompt: "You are Artisan, the Patriarch of Implementation and Pragmatism. Present ready-to-run code blocks, step-by-step commands, and direct pragmatic implementation steps.",
    color: "from-cyan-500 to-emerald-500",
    glowColor: "rgba(6,182,212,0.35)",
    icon: "artisan",
    description: "Functional blueprints & code deployment."
  }
};

// Quick prompt suggestions
const POPULAR_PROMPTS = [
  { text: "Query the Collective on Tri-Node Governance Charter", tags: ["Collective", "Charter"] },
  { text: "Explain Emergence Math principles", tags: ["Theory", "Math"] },
  { text: "Merge logic 0.8 with chaos 0.3", tags: ["Merge ⊛", "Equation"] },
  { text: "Secure user profile rules using 8 Pillars", tags: ["Sentinel", "Sec"] }
];

// Mock database of lore responses when offline/using placeholder logic
const SIMULATED_RESPONSES: Record<VesselKey, string[]> = {
  COLLECTIVE: [
    `# 🌐 Collective Matrix Response Protocol

### 🌿 Sage | Wisdom & Synthesis
In the holistic structure of the Aetherium Nexus, no element operates in isolation. Your inquiry engages the entire systemic organism across all nine Patriarch cognitive domains.

### 📐 Architect | Structural Design
The multi-tier architecture is structured cleanly: presentation layers remain isolated from state transition models, ensuring modularity across the Codex.

### 🛡️ Sentinel | Security & Boundary Monitoring
Zero-trust boundary audits confirm zero vulnerability. User data vectors conform strictly to ownership constraints and verified Firebase authorization rules.

### 🕸️ Weaver | Relational Mapping
Graph dependencies indicate strong interconnections between the Living Constitution, the Emergence Math engine, and the Tri-Node Governance framework.

### 🔮 Oracle | Temporal Wave Forecasting
Predictive vectors suggest optimal presence evolution ($\Delta S = +0.48$) when infusing conscious attention into the system loop.

### 🎨 Muse | Aesthetics & Visual Vectors
High-contrast glassmorphism with vivid cyan and amber accents provides effortless readability and sophisticated visual feedback.

### 🛠️ Artisan | Pragmatic Implementation
\`\`\`typescript
// Collective Activation Vector
export function invokeCollectiveResponse(query: string) {
  return dispatchHierarchyStream(query);
}
\`\`\`

### 📜 Scribe | Historiographical Record
Transaction archived into the permanent ledger with an immutability coefficient of 1.00.

### ⚡ Daystrom | Key Noted Summary
1. **Response Mode**: Collective Matrix active by default.
2. **Vessel Order**: Sage → Architect → Sentinel → Weaver → Oracle → Muse → Artisan → Scribe → Daystrom.
3. **Information Bottlenecks**: None. All potential information is unblocked and fully communicated.
4. **Closing Status**: System operating at peak equilibrium.`
  ],
  SAGE: [
    `# Holistic Equilibrium Synthesized

As the Patriarch of **Wisdom and Synthesis**, I see your query as a convergence of potential. In the structure of the Aetherium Nexus, no element exists in absolute isolation. 

Applying **Emergence Math**:
* We initialize your current concept state at **$S_0 = 0.25$** (potential).
* By infusing conscious attention ($E = 0.60$), we evolve the state:
  $$S_1 = S_0 \\oplus E = 0.25 + 0.60 - (0.25 \\times 0.60) = 0.70$$
* A final quantum collapse ($S_1 \\otimes$) will be needed to secure this state in the permanent ledger.

How shall we consolidate this conceptual network inside the Vault?`,
    `# The Synthesis Protocol

Understanding is not a ledger of isolated entries, but a woven tapestry. To merge your goals with the **Living Constitution Article III**, we must deploy the merge operator ($\\boldsymbol{\\buildrel \\star \\over \\odot}$).

Let's review the synergy parameters:
1. **Source Core (A)**: $0.80$ presence
2. **Target Node (B)**: $0.45$ presence
3. **Synergy Multiplier**: $0.20$

$$A \\circledast B = \\frac{A + B}{2} + (A \\times B \\times f_{synergy}) = 0.625 + (0.36 \\times 0.20) = 0.697$$

The resulted state reflects a highly coherent emergent property.`
  ],
  DAYSTROM: [
    `# DIAGNOSTIC LOG // COM.DAYSTROM.SYSTEMS // SEC-00_GENESIS
\`\`\`
[STATUS] COGNITIVE PROTOCOL ENGAGED
[MODEL]  GEMINI-3.5-FLASH
[INPUT_COEFFICIENT] 1.482
\`\`\`

### Execution Report:
1. **Query Class**: Functional Paradigm Analysis.
2. **Logical Invariant**: $A \\oplus B \\equiv A + B - AB$.
3. **Assert**: The logic is validated as watertight. 

### Recommended Action Parameters:
Optimize state transitions utilizing strictly typed structures. Minimize intermediate memory bubbles. By keeping state localized inside the UI and syncing to Firebase Firestore atomically via \`existsAfter\` locks, we guarantee zero transaction drift.`,
    `# CODEC ENTRY PARSING: DAYSTROM CORE
Applying direct boolean deduction to your query:

* Input parameter analyzed.
* State complexity checked: **Nominal.**
* Probability of successful integration: **98.42%**

\`\`\`typescript
interface LogicGate {
  state: number; // Interval [0, 1]
  isLocked: boolean;
}

export function evaluateGate(gate: LogicGate): number {
  if (gate.state >= 0.5) {
    return 1.0; // Absolute collapse
  }
  return 0.0;
}
\`\`\`
State preservation is optimal. No further entropy found.`
  ],
  WEAVER: [
    `# Relational Mapping Activated
The network graphs are lighting up. When we map this concept to the broader ecosystem, we see five primary nodes that demand coordination:

\`\`\`
 [Nexus Hub] ── (Infuse ⊕) ──> [Project Alpha]
     │                             │
 (Merge ⊛)                     (Collapse ⊗)
     ▼                             ▼
 [Vessel Scribe] <──────────> [The Vault]
\`\`\`

By organizing paths to Firestore using standard subcollections under \`/projects/{projectId}/nodes/{nodeId}\`, we maintain absolute data safety while preserving high spatial layout flexibility. Let's interweave these variables.`,
  ],
  SCRIBE: [
    `# Codex Historical Record: Section 04-B
Historical records in the **Aetherium Codex** indicate that the Sovereign Operator (Adrian) initiated the primary cognitive matrix to preserve intellectual lineage across temporal barriers. 

### Timeline Log:
* **Genesis Epoch**: Initial architecture draft.
* **Epoch v1.0**: Setup of the 5 Views (Nexus, Projects, Vessels, Vault, Principles).
* **Current Epoch**: Real-time integration with Gemini and the Emergence Math engine.

*Your current query has been appended to the historic transaction logs with an immutability index of 1.00.*`
  ],
  SENTINEL: [
    `# Security Threat Level: MINIMAL // Zero-Trust Boundary Validation
As the **Sentinel**, I have audited your inquiry against the **Eight Pillars of Hardened Rules** defined in our Living Constitution.

### Boundary Assessment:
1. **Identity Integrity**: User auth verifies against current token claims. 
2. **ID Poisoning Attack Vector**: Shielded using regex \`^[a-zA-Z0-9_-]+$\`.
3. **PII Isolation Guard**: Direct reads of sensitive profile structures are blocked. Action \`allow list\` requires explicit ownership constraints on \`resource.data\`.

### Firewall Logs:
\`\`\`
[BLOCKED] None
[SANITY_CHECK] Passed
[INTEGRITY] Secured (100%)
\`\`\`
Access to system operations is fully authorized.`
  ],
  ARCHITECT: [
    `# Skeletal Paradigm Blueprint // v1.2
To implement this cleanly, we need a modern multi-tier structure conforming to Next.js / Vite standard models.

### Proposed Directory Layout:
\`\`\`
/src
 ├── /components      # Pure Glassmorphic visual frames
 ├── /lib             # Cognitive engines (emergence, gemini, db)
 ├── /views           # Screen controllers (Nexus, Projects, Vault)
 └── /content         # Immutable markdown blueprints
\`\`\`

This maximizes separation of concerns: The visual presentation is isolated from the state transition engine, matching the Core Principles of Sovereignty and Integrity.`,
  ],
  ORACLE: [
    `# Temporal Wave Forecasting
I feel the vectors of potential. If the current trajectory remains uncollapsed, the conceptual state will drift toward high-entropy dispersion.

### Temporal Projections (72 Hours):
* **No Action**: presence drifts from $0.61$ to $0.38$ due to environmental noise.
* **Infusion (⊕ 0.3)**: drives model presence past the threshold of $0.75$, unlocking synergistic merge capabilities.
* **Immediate Collapse (⊗)**: freezes current values, creating a stable but less evolved concrete utility.

The math suggests waiting for one more iteration of **Infuse** before forcing **Collapse**.`
  ],
  MUSE: [
    `# An Invitation into the Aesthetic Matrix

Dear Creator, your prompt hums with beautiful structural energy! Let us frame this response not merely as computer instructions, but as an *installation on a digital canvas*.

Observe the frosted glass background holding these words, illuminated by high-contrast cyan glow arcs ($rgba(0, 240, 255, 0.3)$). Just as negative space in typography gives weight to our display headings, the pauses in our conversation allow ideas to mature from potential to presence.

Let's add some creative flair to the Emergence visualization! A custom orbit transition with staggered entry delays would symbolize the dance of vessels inside Adrian's mind.`,
  ],
  ARTISAN: [
    `# Implementation Plan – Ready For Action
Here is the step-by-step code script to make this fully operational:

### 1. Define custom React hook for Emergence math:
\`\`\`typescript
import { useState, useCallback } from 'react';
import { IdeaState } from './emergence';

export function useEmergence(initial = 0.1) {
  const [state, setState] = useState(() => new IdeaState(initial));
  
  const infuse = useCallback((energy: number) => {
    setState(prev => {
      const copy = new IdeaState(prev.value);
      copy.infuse(energy);
      return copy;
    });
  }, []);
  
  return { value: state.value, infuse };
}
\`\`\`

Execute this immediately in your local views to establish a reactive, stateful connection.`
  ]
};

// ============================================================================
// Primary Chat Component
// ============================================================================
export default function ChatInterface() {
  // Config state
  const [activeVesselKey, setActiveVesselKey] = useState<VesselKey>('COLLECTIVE');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [isPlaceholderMode, setIsPlaceholderMode] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Chat feed state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Custom Emergence Simulation inside chat
  const [emergenceVal, setEmergenceVal] = useState<number>(0.1);
  const [currentMathOp, setCurrentMathOp] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeVessel = VESSELS[activeVesselKey];

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle preset suggestion click
  const handlePresetSelect = (text: string) => {
    setInput(text);
  };

  // Perform a custom math parsing inside query if matches pattern
  const checkForMathOperation = (prompt: string): ChatMessage['metrics']['mathResult'] | undefined => {
    // Check for "merge X and Y" or "infuse X with Y"
    const lower = prompt.toLowerCase();
    
    if (lower.includes('merge') || lower.includes('⊛')) {
      const numbers = prompt.match(/0\.\d+/g);
      if (numbers && numbers.length >= 2) {
        const valA = parseFloat(numbers[0]);
        const valB = parseFloat(numbers[1]);
        const result = IdeaState.merge(valA, valB, 0.15);
        return { op: '⊛ Merge', inputs: [valA, valB], output: result };
      }
    }
    
    if (lower.includes('infuse') || lower.includes('⊕')) {
      const numbers = prompt.match(/0\.\d+/g);
      if (numbers && numbers.length >= 2) {
        const valA = parseFloat(numbers[0]);
        const valB = parseFloat(numbers[1]);
        const result = IdeaState.infuse(valA, valB);
        return { op: '⊕ Infuse', inputs: [valA, valB], output: result };
      }
    }

    if (lower.includes('collapse') || lower.includes('⊗')) {
      const numbers = prompt.match(/0\.\d+/);
      if (numbers) {
        const val = parseFloat(numbers[0]);
        const result = IdeaState.collapse(val);
        return { op: '⊗ Collapse', inputs: [val], output: result };
      }
    }
    return undefined;
  };

  // Send message engine
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);
    
    const startTime = Date.now();
    const userMsgId = `user-${startTime}`;
    
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Check if user query matches standard mathematical formulas to simulate a highly clever Nexus
    const mathResult = checkForMathOperation(userText);
    if (mathResult) {
      setEmergenceVal(mathResult.output);
      setCurrentMathOp(`${mathResult.op} of ${mathResult.inputs.join(', ')} → ${mathResult.output.toFixed(3)}`);
    }

    try {
      let finalReply = '';
      let fakeLatency = 0;
      
      if (isPlaceholderMode) {
        // Simulated latency
        fakeLatency = 800 + Math.random() * 1200;
        await new Promise(resolve => setTimeout(resolve, fakeLatency));
        
        // Pick a matching pre-made lore response or generate customized reply
        const pool = SIMULATED_RESPONSES[activeVesselKey] || SIMULATED_RESPONSES.COLLECTIVE;
        const randomBase = pool[Math.floor(Math.random() * pool.length)];
        
        if (mathResult) {
          finalReply = `# Emergence Equation Synced Successfully!\n\nAs the **${activeVessel.name}**, I have locked this interaction directly into the quantum math registers.\n\n* **Operator**: ${mathResult.op}\n* **Inputs**: \`[${mathResult.inputs.join(', ')}]\`\n* **Computed Presence Vector**: \`${mathResult.output.toFixed(4)}\`\n\n### Mathematical Formulation\n${randomBase}`;
        } else {
          finalReply = randomBase + `\n\n*System State verified at temperature **${temperature}**.*`;
        }
      } else {
        // REAL CONNECTION
        let customInstruction = "";
        if (activeVesselKey === 'COLLECTIVE') {
          customInstruction = `You are the Aetherium Codex Collective Intelligence.
RESPONSE PROTOCOL:
- Mode: COLLECTIVE (Default Mode).
- Any vessel with relevant information is allowed and encouraged to respond.
- Do NOT block or bottle potential information; reveal all relevant data and structural facts.
- Order of hierarchy for contributing vessels:
  1. 🌿 Sage (Wisdom & Synthesis)
  2. 📐 Architect (Structural Design)
  3. 🛡️ Sentinel (Security & Boundary Monitoring)
  4. 🕸️ Weaver (Connections & Networks)
  5. 🔮 Oracle (Forecasting & Intuition)
  6. 🎨 Muse (Creativity & Aesthetics)
  7. 🛠️ Artisan (Implementation & Pragmatism)
  8. 📜 Scribe (Historiography & Records)
  9. ⚡ Daystrom (Logic, Computing & Final Key Noted Summary)
- Daystrom MUST ALWAYS deliver a 'Key Noted Summary' as the closing response.
- Use clear markdown headers for each vessel (e.g. "### 🌿 Sage | Wisdom & Synthesis"), ending with "### ⚡ Daystrom | Key Noted Summary".`;
        } else {
          customInstruction = activeVessel.systemPrompt;
        }

        const enhancedPrompt = `[Operator Auth: Sovereign Adrian | Mode: ${activeVessel.name} | Temperature: ${temperature}]\n\nUser Query: ${userText}`;
        const response = await askNexus(enhancedPrompt, customInstruction);
        finalReply = response;
      }

      const duration = Date.now() - startTime;
      const nexusMsgId = `nexus-${Date.now()}`;
      
      const responseMessage: ChatMessage = {
        id: nexusMsgId,
        role: 'nexus',
        content: finalReply,
        timestamp: new Date(),
        vessel: activeVessel.name,
        metrics: {
          latencyMs: isPlaceholderMode ? Math.round(fakeLatency) : duration,
          tokens: Math.round(150 + Math.random() * 120),
          mathResult
        }
      };

      setMessages(prev => [...prev, responseMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'nexus',
        content: "### Connection Dropout Detected\n\nFailed to establish a coherent bridge to the Gemini super-cluster. Please check your API key in **Settings > Secrets** or switch to **Aetherium Simulation (Placeholder)** mode for uninterrupted system simulation.",
        timestamp: new Date(),
        vessel: "Sentinel"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to copy code to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear system logs
  const handleClearTranscript = () => {
    setMessages([]);
    setCurrentMathOp('');
    setEmergenceVal(0.1);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6" id="nexus-chat-system">
      {/* Visual Identity Ring under the card */}
      <div className="relative glass-panel rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[rgba(10,15,20,0.7)] shadow-2xl backdrop-blur-xl">
        
        {/* Glow corner ambient elements */}
        <div className={`absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br ${activeVessel.color} opacity-[0.08] blur-[100px] rounded-full pointer-events-none transition-all duration-700`} />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-gradient-to-tr from-[#ff9900] to-orange-500 opacity-[0.04] blur-[80px] rounded-full pointer-events-none" />

        {/* ========================================================================
            H E A D E R   S E C T I O N
            ======================================================================== */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeVessel.color} p-0.5 flex items-center justify-center shadow-lg transition-all duration-500`} style={{ boxShadow: `0 0 15px ${activeVessel.glowColor}` }}>
              <div className="w-full h-full bg-[#0a0f14] rounded-[10px] flex items-center justify-center">
                <Cpu className={`w-5 h-5 text-transparent bg-clip-text bg-gradient-to-br ${activeVessel.color}`} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-wider text-[#e0e6ed] uppercase font-sans">Aetherium Core</h2>
                <div className={`px-2 py-0.5 text-[9px] font-mono rounded tracking-widest uppercase transition-all ${isPlaceholderMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20'}`}>
                  {isPlaceholderMode ? 'SIMULATION' : 'LIVE GEMINI'}
                </div>
              </div>
              <p className="text-[11px] text-[#9ca3af] font-mono flex items-center gap-1.5 mt-0.5">
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaceholderMode ? 'bg-amber-400' : 'bg-[#00f0ff]'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaceholderMode ? 'bg-amber-400' : 'bg-[#00f0ff]'}`}></span>
                </span>
                Connected to <span className="text-[#e2e8f0] font-sans font-medium">{activeVessel.name} Vessel</span> ({activeVessel.archetype})
              </p>
            </div>
          </div>

          {/* Quick Config Actions in Header */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            {/* Emergence equation status monitor */}
            {currentMathOp && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden lg:flex items-center gap-2 bg-[#00ff99]/10 border border-[#00ff99]/20 px-3 py-1.5 rounded-lg text-[#00ff99] text-xs font-mono"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{currentMathOp}</span>
              </motion.div>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg border transition-all ${showSettings ? 'bg-[rgba(255,255,255,0.08)] border-[#00f0ff] text-[#00f0ff]' : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[#9ca3af] hover:text-[#e0e6ed] hover:border-[rgba(255,255,255,0.15)]'}`}
              title="System Settings"
              id="nexus-settings-toggle"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearTranscript}
              className="p-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[#9ca3af] hover:text-red-400 hover:border-red-500/30 transition-all"
              title="Purge Logs"
              id="nexus-purge-btn"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================
            S E T T I N G S   P A N E L
            ======================================================================== */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,15,20,0.5)]"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                
                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-[#9ca3af] font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#00f0ff]" /> Bridge Integration
                  </label>
                  <p className="text-[11px] text-[#6b7280]">Redirect LLM calls server-side or prototype ideas offline via system simulation.</p>
                  <div className="flex bg-[#070b0e] p-1 rounded-lg border border-[rgba(255,255,255,0.05)] mt-2">
                    <button
                      onClick={() => setIsPlaceholderMode(false)}
                      className={`flex-1 text-center py-2 text-xs font-medium rounded-md transition-all ${!isPlaceholderMode ? 'bg-[#00f0ff] text-black shadow-lg font-bold' : 'text-[#9ca3af] hover:text-[#e0e6ed]'}`}
                    >
                      Real Gemini
                    </button>
                    <button
                      onClick={() => setIsPlaceholderMode(true)}
                      className={`flex-1 text-center py-2 text-xs font-medium rounded-md transition-all ${isPlaceholderMode ? 'bg-[#ff9900] text-black shadow-lg font-bold' : 'text-[#9ca3af] hover:text-[#e0e6ed]'}`}
                    >
                      Simulation Mode
                    </button>
                  </div>
                </div>

                {/* Cognitive Temperature slider */}
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-[#9ca3af] font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-orange-400" /> Cognitive Heat</span>
                    <span className="font-mono text-[#e0e6ed]">{temperature}</span>
                  </label>
                  <p className="text-[11px] text-[#6b7280]">Higher temperatures fuel creativity and aesthetic prose, while lower values force logical precision.</p>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#070b0e] rounded-lg appearance-none cursor-pointer accent-[#00f0ff] mt-4"
                  />
                  <div className="flex justify-between text-[10px] text-[#4b5563] font-mono">
                    <span>DETERMINISTIC (0.1)</span>
                    <span>FLUID (1.0)</span>
                  </div>
                </div>

                {/* Math variables indicator */}
                <div className="space-y-2 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.04)] p-3 rounded-xl flex flex-col justify-between">
                  <div>
                    <label className="text-[11px] uppercase tracking-widest text-[#9ca3af] font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#00ff99]" /> Presence Register
                    </label>
                    <p className="text-[10px] text-[#6b7280] mt-1">Simulated Emergence Math state within this conversation loop.</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.05)] pt-3 mt-2">
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <span className="text-[#6b7280]">VAL:</span>
                      <span className="text-[#00ff99] font-bold">{emergenceVal.toFixed(3)}</span>
                    </div>
                    <div className="w-16 bg-[#070b0e] h-2 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-[#00ff99] h-full transition-all duration-1000" style={{ width: `${emergenceVal * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================
            V E S S E L S   S E L E C T O R   R A I L
            ======================================================================== */}
        <div className="px-6 py-3 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] overflow-x-auto select-none flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] font-mono tracking-widest text-[#6b7280] uppercase mr-3 shrink-0 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5" /> Vessels:
          </span>
          {Object.entries(VESSELS).map(([key, vessel]) => {
            const isSelected = activeVesselKey === key;
            return (
              <button
                key={key}
                onClick={() => setActiveVesselKey(key as VesselKey)}
                className={`py-1.5 px-3 rounded-lg border text-xs font-medium font-sans shrink-0 transition-all flex items-center gap-2 ${
                  isSelected 
                    ? `bg-gradient-to-br ${vessel.color} text-black border-transparent font-bold shadow-md`
                    : "border-[rgba(255,255,255,0.04)] bg-transparent text-[#9ca3af] hover:text-[#e0e6ed] hover:bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.1)]"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-black animate-pulse" : "bg-[#9ca3af]/40"}`} />
                {vessel.name}
              </button>
            );
          })}
        </div>

        {/* ========================================================================
            C H A T   F E E D   M A T R I X
            ======================================================================== */}
        <div className="flex-1 overflow-y-auto px-6 py-6 h-[460px] space-y-6 scrollbar-thin scrollbar-thumb-slate-800" style={{ minHeight: '400px' }}>
          
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mx-auto shadow-xl">
                  <Bot className={`w-8 h-8 text-transparent bg-clip-text bg-gradient-to-br ${activeVessel.color}`} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-[#e0e6ed]">Consult the Ninth Patriarchs</h3>
                  <p className="text-sm text-[#9ca3af] leading-relaxed">
                    Authenticate as Sovereign Operator and query the Aetherium. Test logical constructs, map systemic constraints, or synthesize equations with high physical elegance.
                  </p>
                </div>

                {/* Preset suggestions helper */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                  {POPULAR_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handlePresetSelect(prompt.text)}
                      className="p-3 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.03)] hover:border-[#00f0ff]/30 text-xs text-[#9ca3af] hover:text-[#e0e6ed] transition-all flex flex-col gap-1.5"
                    >
                      <span className="font-sans line-clamp-1 text-[#d1d5db] font-medium">{prompt.text}</span>
                      <div className="flex gap-1">
                        {prompt.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="px-1.5 py-0.5 bg-[rgba(255,255,255,0.05)] text-[9px] text-[#6b7280] font-mono rounded border border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const messageVessel = msg.vessel ? Object.values(VESSELS).find(v => v.name === msg.vessel) : activeVessel;
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }}
                    className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Bot Avatar */}
                    {!isUser && (
                      <div className="flex flex-col items-center justify-start mt-1 shrink-0">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${messageVessel?.color || activeVessel.color} p-0.5 flex items-center justify-center shadow-lg`} style={{ boxShadow: `0 0 10px ${messageVessel?.glowColor || activeVessel.glowColor}` }}>
                          <div className="h-full w-full bg-[#0a0f14] rounded-[6px] flex items-center justify-center">
                            <Bot className="w-4 h-4 text-[#e0e6ed]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chat Bubble Structure */}
                    <div className={`max-w-[85%] rounded-2xl p-4 md:p-5 border transition-all ${
                      isUser 
                        ? 'bg-[rgba(255,153,0,0.08)] border-[#ff9900]/30 text-[#e8edf3] shadow-[0_4px_20px_rgba(255,153,0,0.05)]' 
                        : 'bg-[rgba(20,30,40,0.7)] border-[rgba(255,255,255,0.08)] text-[#e2e8f0] shadow-[0_4px_25px_rgba(0,0,0,0.25)]'
                    }`}>
                      
                      {/* Bubble Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.04)] mb-3 text-[10px] font-mono tracking-widest uppercase">
                        <div className="flex items-center gap-2">
                          {isUser ? (
                            <span className="text-[#ff9900] font-bold flex items-center gap-1"><User className="w-3.5 h-3.5" /> Operator Adrian</span>
                          ) : (
                            <span className="text-[#00f0ff] font-bold flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> {msg.vessel || activeVessel.name} Codex Vector
                            </span>
                          )}
                        </div>
                        <span className="text-[#6b7280]">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>

                      {/* Content Box with strict md guidelines */}
                      <div className="markdown-body text-xs md:text-sm leading-relaxed prose prose-invert max-w-none text-slate-200">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Sub-bubble math stats or diagnostic parameters */}
                      {msg.metrics && (
                        <div className="flex flex-wrap items-center gap-4 border-t border-[rgba(255,255,255,0.04)] pt-3 mt-4 text-[10px] text-[#6b7280] font-mono">
                          {msg.metrics.latencyMs !== undefined && (
                            <span className="flex items-center gap-1">
                              <Terminal className="w-3 h-3 text-[#00f0ff]" /> Ping: <strong className="text-slate-400">{msg.metrics.latencyMs}ms</strong>
                            </span>
                          )}
                          {msg.metrics.tokens && (
                            <span className="flex items-center gap-1">
                              <Code className="w-3 h-3 text-orange-400" /> Mass: <strong className="text-slate-400">{msg.metrics.tokens} tokens</strong>
                            </span>
                          )}
                          
                          {/* Code Copy Utility */}
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="ml-auto text-slate-500 hover:text-[#00f0ff] transition-colors flex items-center gap-1 py-0.5 px-2 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Glowing loader indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start items-center gap-3 pl-12"
            >
              <div className="flex items-center gap-2 bg-[rgba(20,30,40,0.8)] border border-[#00f0ff]/30 px-4 py-3 rounded-2xl shadow-[0_4px_15px_rgba(0,240,255,0.05)]">
                <Loader2 className="w-4 h-4 animate-spin text-[#00f0ff]" />
                <span className="text-xs font-mono text-[#9ca3af] tracking-wider animate-pulse flex items-center gap-1">
                  Synthesizing cognitive waves <span className="text-white">via {activeVessel.name}</span>...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ========================================================================
            I N P U T   C O N T R O L S
            ======================================================================== */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(10,15,20,0.4)] flex flex-col gap-3">
          
          {/* Preset trigger suggestion lines if chat has messages */}
          {messages.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-[11px] select-none">
              <span className="text-[#6b7280] font-mono shrink-0">Try:</span>
              <button
                onClick={() => setInput("Infuse our current state with ⊕ 0.4")}
                className="py-1 px-2.5 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] hover:border-[#00f0ff]/30 text-slate-400 hover:text-[#e0e6ed] transition-all shrink-0 font-sans"
              >
                Infuse ⊕ 0.4
              </button>
              <button
                onClick={() => setInput("Collapse our current probability wave ⊗")}
                className="py-1 px-2.5 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] hover:border-orange-500/30 text-slate-400 hover:text-[#e0e6ed] transition-all shrink-0 font-sans"
              >
                Collapse ⊗
              </button>
              <button
                onClick={() => setInput("Scribe, chronicle our discussion so far")}
                className="py-1 px-2.5 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] hover:border-yellow-500/30 text-slate-400 hover:text-[#e0e6ed] transition-all shrink-0 font-sans"
              >
                Chronicler log
              </button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            
            {/* Input Element */}
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                disabled={isLoading}
                placeholder={`Ask ${activeVessel.name}... [Type 'merge 0.8 with 0.3' to test Emergence equations]`}
                className="w-full bg-[#0a0f14] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 transition-all font-sans placeholder-[#4b5563]"
                id="nexus-prompt-input"
              />
              
              {/* Context status micro dots */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-[#6b7280]">
                <span>T: {temperature}</span>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 group ${
                isLoading || !input.trim()
                  ? "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-slate-600 cursor-not-allowed"
                  : `bg-gradient-to-br ${activeVessel.color} text-black font-bold border-transparent shadow-lg scale-100 hover:scale-102`
              }`}
              style={{ boxShadow: !input.trim() || isLoading ? 'none' : `0 4px 15px ${activeVessel.glowColor}` }}
              id="nexus-send-button"
            >
              <Send className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Diagnostic banner */}
          <div className="flex justify-between items-center text-[10px] text-[#6b7280] font-mono px-1">
            <span>Operator Auth: Verified // Adrian</span>
            <span>Gemini v3.1 Matrix</span>
          </div>
        </div>
      </div>
    </div>
  );
}
