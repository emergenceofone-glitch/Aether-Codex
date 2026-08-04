/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from './firebase';
import { getAllChapters, getChapterBySlug } from './lib/codex';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { askNexus } from './lib/gemini';
import { Loader2, Send } from 'lucide-react';
import ProjectsView from './views/ProjectsView';
import DriveView from './views/DriveView';
import LedgerView from './views/LedgerView';
import AntigravityView from './views/AntigravityView';
import EcosystemView from './views/EcosystemView';
import MediaGalleryView from './views/MediaGalleryView';
import ChatInterface from './components/ChatInterface';

import { IdeaState } from './lib/emergence';
import { Sparkles, Zap, GitMerge, Activity, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function EmergenceVisualizer() {
  const [idea, setIdea] = useState(new IdeaState(0.1));
  const [logs, setLogs] = useState<string[]>(["Potential initialized: 0.1"]);
  const [history, setHistory] = useState<{ time: string; value: number }[]>([
    { time: new Date().toLocaleTimeString(), value: 0.1 }
  ]);

  const recordHistory = (val: number) => {
    const timeStr = new Date().toLocaleTimeString();
    setHistory(prev => [...prev, { time: timeStr, value: parseFloat(val.toFixed(3)) }].slice(-15));
  };

  const handleInfuse = () => {
    const energy = 0.2;
    idea.infuse(energy);
    setIdea(new IdeaState(idea.value));
    recordHistory(idea.value);
    setLogs(prev => [`⊕ Infused ${energy} energy. New state: ${idea.value.toFixed(3)}`, ...prev].slice(0, 5));
  };

  const handleCollapse = () => {
    const old = idea.value;
    idea.collapse();
    setIdea(new IdeaState(idea.value));
    recordHistory(idea.value);
    setLogs(prev => [`⊗ Collapsed from ${old.toFixed(3)} to ${idea.value}.`, ...prev].slice(0, 5));
  };

  const handleMerge = () => {
    const virtualIdea = new IdeaState(Math.random());
    const old = idea.value;
    idea.merge(virtualIdea);
    setIdea(new IdeaState(idea.value));
    recordHistory(idea.value);
    setLogs(prev => [`⊛ Merged ${old.toFixed(3)} with ${virtualIdea.value.toFixed(3)}. Result: ${idea.value.toFixed(3)}`, ...prev].slice(0, 5));
  };

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      ideaPresenceValue: idea.value,
      history: history,
      logs: logs
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `emergence_logs_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="glass-panel p-6 mb-12 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-[#00f0ff] w-5 h-5" />
          <h2 className="text-xl font-bold tracking-tight text-[#e0e6ed]">Emergence Probabilities & Fluctuation</h2>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00f0ff15] border border-[#00f0ff44] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black rounded-lg text-xs font-bold transition-all"
          title="Export Logs & History as JSON"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Gauge & Actions */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-6 items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80" cy="80" r="68"
                stroke="var(--glass-border)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80" cy="80" r="68"
                stroke="var(--neon-blue)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={427.2}
                strokeDashoffset={427.2 * (1 - idea.value)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-mono font-bold text-[#e0e6ed]">{idea.value.toFixed(3)}</span>
              <span className="text-[9px] uppercase tracking-widest text-[#9ca3af]">Presence</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={handleInfuse} className="flex flex-col items-center gap-1 p-2 border border-[#ffffff1a] rounded hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">Infuse</span>
              </button>
              <button onClick={handleCollapse} className="flex flex-col items-center gap-1 p-2 border border-[#ffffff1a] rounded hover:border-[#ff9900] hover:text-[#ff9900] transition-all">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">Collapse</span>
              </button>
              <button onClick={handleMerge} className="flex flex-col items-center gap-1 p-2 border border-[#ffffff1a] rounded hover:border-[#00ff99] hover:text-[#00ff99] transition-all">
                <GitMerge className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">Merge</span>
              </button>
            </div>

            <div className="bg-[#00000033] p-3 rounded font-mono text-[10px] text-[#9ca3af] h-20 overflow-hidden">
              {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="lg:col-span-7 bg-[#00000040] border border-[#ffffff10] p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#9ca3af]">
            <span>Probability Fluctuation Timeline</span>
            <span className="text-[#00f0ff]">Live Recharts Telemetry</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#05070a', borderColor: '#00f0ff44', borderRadius: '8px', fontSize: '11px', color: '#e0e6ed' }}
                  itemStyle={{ color: '#00f0ff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00f0ff" 
                  strokeWidth={2} 
                  dot={{ fill: '#00f0ff', r: 3 }} 
                  activeDot={{ r: 6, fill: '#ff9900' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function NexusHome() {
  const chapters = getAllChapters();

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-[#00f0ff] mb-4 tracking-widest uppercase">
          Aetherium Nexus v1.0
        </h1>
        <p className="text-[#9ca3af]">Legacy for Language: The Aetherium Codex</p>
      </header>

      <EmergenceVisualizer />

      <div className="grid gap-6 md:grid-cols-2">
        {chapters.map((chapter) => (
          <Link to={`/chapter/${chapter.slug}`} key={chapter.slug}>
            <div className="glass-panel p-6 hover:border-[#00f0ff] transition-colors duration-300 cursor-pointer group h-full">
              <h2 className="text-xl font-semibold text-[#e0e6ed] group-hover:text-[#00f0ff] transition-colors">
                {chapter.title}
              </h2>
              <p className="text-sm text-[#6b7280] mt-2 font-mono">{chapter.slug}.md</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ChapterView({ slug }: { slug: string }) {
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    return <div className="text-center text-red-400 mt-20">Chapter not found in the Codex.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="mb-8">
        <Link to="/" className="text-[#00f0ff] hover:text-[#ff9900] transition-colors font-mono text-sm">
          ← Return to Nexus
        </Link>
      </nav>

      <article className="glass-panel p-8 md:p-12">
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {chapter.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}

function ChapterRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <ChapterView slug={slug || ''} />;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center text-[#00f0ff]">Initializing Nexus...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen p-4 md:p-8">
        <nav className="max-w-4xl mx-auto flex justify-between items-center mb-12 glass-panel px-6 py-4">
          <div className="font-bold text-xl tracking-wider text-[#e0e6ed]">
            <Link to="/">AETHERIUM<span className="text-[#00f0ff]">_CODEX</span></Link>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/ecosystem" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors flex items-center gap-1 font-medium">
              <span>Ecosystem Hub</span>
            </Link>
            <Link to="/promo" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors flex items-center gap-1 font-medium">
              <span>Media Kit</span>
            </Link>
            <Link to="/antigravity" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors flex items-center gap-1 font-medium">
              <span>Antigravity SDK</span>
            </Link>
            <Link to="/ledger" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors flex items-center gap-1 font-medium">
              <span>History & Ledger</span>
            </Link>
            <Link to="/projects" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors">Projects</Link>
            <Link to="/drive" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors flex items-center gap-1">
              <span>Drive Vault</span>
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#9ca3af] hidden md:inline-block">{user.email}</span>
                <button 
                  onClick={logout}
                  className="text-sm border border-[#ff9900] text-[#ff9900] px-3 py-1 rounded hover:bg-[#ff9900] hover:text-black transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="text-sm bg-[#00f0ff] text-black px-4 py-2 rounded font-medium hover:bg-[#00c0cc] transition-colors"
              >
                Authenticate
              </button>
            )}
          </div>
        </nav>

        {user ? (
          <>
            <Routes>
              <Route path="/" element={<NexusHome />} />
              <Route path="/chapter/:slug" element={<ChapterRoute />} />
              <Route path="/ecosystem" element={<EcosystemView />} />
              <Route path="/promo" element={<MediaGalleryView />} />
              <Route path="/antigravity" element={<div className="mb-20"><AntigravityView /></div>} />
              <Route path="/ledger" element={<LedgerView />} />
              <Route path="/projects" element={<ProjectsView />} />
              <Route path="/drive" element={<DriveView />} />
            </Routes>
            <ChatInterface />
          </>
        ) : (
          <div className="max-w-md mx-auto mt-20 text-center glass-panel p-8">
            <h2 className="text-2xl font-bold text-[#ff9900] mb-4">Access Restricted</h2>
            <p className="text-[#9ca3af] mb-8">You must authenticate to access the Aetherium Nexus and interact with the Sovereign Operator's tools.</p>
            <button 
              onClick={loginWithGoogle}
              className="w-full bg-[#00f0ff] text-black px-4 py-3 rounded font-bold hover:bg-[#00c0cc] transition-colors text-lg"
            >
              Initialize Connection
            </button>
          </div>
        )}
      </div>
    </Router>
  );
}
