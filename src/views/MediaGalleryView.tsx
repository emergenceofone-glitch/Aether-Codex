import { useState } from 'react';
import { 
  Camera, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Layers, 
  Smartphone, 
  Activity, 
  ShoppingBag, 
  Sparkles, 
  BookOpen, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  Maximize2, 
  X, 
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface PromoSnapshot {
  id: string;
  version: string;
  title: string;
  platform: 'Cognitive Gateway (Mobile)' | 'Nexus Observer (Physics)' | 'Aetherium Store (Edge)' | 'NotebookLM Vault' | 'Tri-Node Ledger';
  category: 'App UI' | 'Hardware/Physics' | 'E-Commerce' | 'Knowledge Base';
  date: string;
  description: string;
  accentColor: string;
  badge: string;
  imageUrl: string;
  highlights: string[];
}

export default function MediaGalleryView() {
  const [selectedSnapshot, setSelectedSnapshot] = useState<PromoSnapshot | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const snapshots: PromoSnapshot[] = [
    {
      id: 'snap-01',
      version: 'v1.2.0',
      title: 'Cognitive Gateway Mobile App - Prompt Optimizer',
      platform: 'Cognitive Gateway (Mobile)',
      category: 'App UI',
      date: '2026-08-03',
      description: 'Mobile dark terminal UI optimized for prompt token compression, sycophancy detection, and real-time elegance coefficient calculation.',
      accentColor: 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff10]',
      badge: 'Mobile Live',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      highlights: ['Token Reduction Rate: 42.8%', 'Elegance Score: 98.4/100', 'Dark Mode High Contrast', 'Gamified Streak System']
    },
    {
      id: 'snap-02',
      version: 'v0.5.1',
      title: 'Nexus Observer - RE-ALITY 60Hz Physics Engine',
      platform: 'Nexus Observer (Physics)',
      category: 'Hardware/Physics',
      date: '2026-08-02',
      description: 'Prolate ellipsoid rugby mechanics telemetry HUD with BLE 200Hz pedal sampling, pneumatic pressure dynamics, and gesture lattice controls.',
      accentColor: 'border-purple-500 text-purple-300 bg-purple-950/30',
      badge: '60Hz Engine',
      imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
      highlights: ['6-Skin Tension Vectors', 'Pneumatic Damping Curve', 'BLE AETHER-PEDAL @ 200Hz', 'Google Drive Vault Sync']
    },
    {
      id: 'snap-03',
      version: 'v2.0.0',
      title: 'Aetherium Cyber Storefront - Cloudflare Edge',
      platform: 'Aetherium Store (Edge)',
      category: 'E-Commerce',
      date: '2026-08-01',
      description: 'Headless e-commerce marketplace powered by Cloudflare Workers and Shopify, offering Faraday Hoodies, CyberDecks, and Quantum Core chips.',
      accentColor: 'border-amber-500 text-amber-400 bg-amber-950/30',
      badge: 'Edge Marketplace',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      highlights: ['Cloudflare Edge <100ms', 'Payfast / Ozow Payment Gateway', 'Merchant Dashboard Analytics', '15+ Cyber Hardware Items']
    },
    {
      id: 'snap-04',
      version: 'v1.0.0',
      title: 'Google NotebookLM Grounding Research Vault',
      platform: 'NotebookLM Vault',
      category: 'Knowledge Base',
      date: '2026-08-03',
      description: 'NotebookLM interactive knowledge core containing grounding source documents for the 9 Patriarch Vessels and Aetherium Codex lore.',
      accentColor: 'border-rose-500 text-rose-300 bg-rose-950/30',
      badge: 'Research Vault',
      imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80',
      highlights: ['9 Patriarch Vessel Sources', 'Audio Overview Podcast Synthesizer', 'Semantic Citation Links', 'Shared Grounding Notebook']
    },
    {
      id: 'snap-05',
      version: 'v1.1.0',
      title: 'Tri-Node Immutable Ledger & Master Pulse',
      platform: 'Tri-Node Ledger',
      category: 'App UI',
      date: '2026-08-03',
      description: 'Blockchain block verification suite with 40Hz pulse frequency tracking, SHA-256 cryptographic hashes, and Google Drive auto-backup.',
      accentColor: 'border-emerald-500 text-emerald-400 bg-emerald-950/30',
      badge: 'Ledger Chain',
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
      highlights: ['SHA-256 Block Verification', '40Hz Master Pulse Engine', 'Coherence Rating 99.9%', 'Dual-Lock Byzantine Audit']
    }
  ];

  const socialPromoPosts = [
    {
      platform: 'Twitter / X Thread',
      title: '🚀 Announcing Aetherium Codex Tri-Node Ecosystem v1.0',
      text: `⚡ The Aetherium Codex Ecosystem is live across 3 synchronized nodes:\n\n1️⃣ Mobile Cognitive Gateway: AI prompt token compression & elegance score dial\n2️⃣ Nexus Observer: RE-ALITY 60Hz physics engine & BLE pedal telemetry\n3️⃣ Aetherium Store: Cyber hardware marketplace on Cloudflare Edge\n4️⃣ NotebookLM Research Vault: Interactive source grounding\n\n🔗 Explore: https://aetherium-codex.ai.studio/`
    },
    {
      platform: 'LinkedIn Press Release',
      title: 'Aetherium Ecosystem: Unifying AI Intelligence, Physics & Hardware',
      text: `We are excited to unveil the unified Aetherium Ecosystem architecture.\n\nBy linking mobile prompt optimization (Cognitive Gateway), high-precision rugby ellipsoid physics (Nexus Observer), and edge e-commerce (Aetherium Store) through an immutable SHA-256 ledger, Aetherium offers an integrated ecosystem experience.\n\nKey highlights:\n- 40Hz Master Pulse Engine\n- Aether Points Cross-Platform Rewards\n- Google Drive Vault Synchronization\n- Google NotebookLM Grounding Core`
    }
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleExportPressKit = () => {
    const pressKit = {
      brand: 'Aetherium Codex Ecosystem',
      date: new Date().toISOString(),
      nodes: [
        'Cognitive Gateway Mobile App (https://aethergate-stv5talj.manus.space)',
        'Nexus Observer Physics Engine (https://aetherium-nexus-observer-370919990469.europe-west1.run.app/)',
        'Aetherium Cyber Storefront (https://aetherium-store.ai.studio/)',
        'NotebookLM Research Vault (https://notebooklm.google.com/notebook/dd603037-a662-411c-8173-570f33b72306)'
      ],
      brandColors: {
        primaryCyan: '#00f0ff',
        accentAmber: '#ff9900',
        emeraldSuccess: '#10b981',
        purpleVessel: '#a855f7',
        roseVault: '#f43f5e',
        darkCanvas: '#05070a'
      },
      typography: 'Playfair Display + Plus Jakarta Sans + Space Mono',
      snapshots: snapshots
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pressKit, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Aetherium_Ecosystem_PressKit_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredSnapshots = snapshots.filter(s => 
    activeCategory === 'All' || s.category === activeCategory
  );

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-[#00f0ff33] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#00f0ff1a] border border-[#00f0ff4d] rounded-2xl text-[#00f0ff]">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-widest uppercase text-[#e0e6ed]">
                Promotional Materials & Snapshots
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f0ff20] text-[#00f0ff] border border-[#00f0ff44] uppercase">
                Media Kit
              </span>
            </div>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              Live Evolving App Snapshots, Brand Guidelines & Marketing Copy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPressKit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00f0ff] text-black font-bold text-xs hover:bg-[#00c0cc] transition-all shadow-md shadow-[#00f0ff22]"
          >
            <Download className="w-4 h-4" />
            <span>Download Press Kit JSON</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#ffffff15] pb-3 text-xs">
        {['All', 'App UI', 'Hardware/Physics', 'E-Commerce', 'Knowledge Base'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-[#00f0ff] text-black'
                : 'text-[#9ca3af] hover:text-white bg-[#00000040]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Snapshots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSnapshots.map(snap => (
          <div
            key={snap.id}
            className="glass-panel overflow-hidden group hover:border-[#00f0ff66] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Snapshot Image Preview Frame */}
              <div className="relative aspect-video overflow-hidden bg-black/60 border-b border-[#ffffff10]">
                <img
                  src={snap.imageUrl}
                  alt={snap.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase ${snap.accentColor}`}>
                    {snap.badge}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-gray-300 border border-white/10">
                    {snap.version}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedSnapshot(snap)}
                  className="absolute bottom-3 right-3 p-2 bg-black/80 hover:bg-[#00f0ff] hover:text-black text-white rounded-lg transition-all"
                  title="Enlarge Snapshot"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Info Payload */}
              <div className="p-5 space-y-3">
                <div className="text-[10px] font-mono text-[#9ca3af] flex justify-between">
                  <span>{snap.platform}</span>
                  <span>Captured: {snap.date}</span>
                </div>

                <h3 className="text-sm font-bold text-[#e0e6ed] group-hover:text-[#00f0ff] transition-colors leading-snug">
                  {snap.title}
                </h3>

                <p className="text-xs text-[#9ca3af] leading-relaxed line-clamp-2">
                  {snap.description}
                </p>

                {/* Highlights List */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {snap.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono bg-[#00000060] border border-[#ffffff10] text-gray-300 px-2 py-0.5 rounded"
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Card Actions */}
            <div className="p-4 bg-[#00000040] border-t border-[#ffffff10] flex items-center justify-between text-xs">
              <button
                onClick={() => setSelectedSnapshot(snap)}
                className="text-[#00f0ff] hover:underline font-mono text-[11px] flex items-center gap-1"
              >
                <ImageIcon className="w-3.5 h-3.5" /> Inspect Full Snapshot
              </button>

              <button
                onClick={() => handleCopy(snap.imageUrl, snap.id)}
                className="text-[#9ca3af] hover:text-white font-mono text-[11px] flex items-center gap-1"
              >
                {copiedText === snap.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === snap.id ? 'Copied URL' : 'Copy Image CDN'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Social Media Promotional Templates */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#9ca3af] flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#00f0ff]" /> Copywriting & Promotional Templates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialPromoPosts.map((post, idx) => (
            <div key={idx} className="p-4 bg-[#00000040] border border-[#ffffff10] rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#ffffff10] pb-2">
                <span className="text-xs font-bold text-[#00f0ff] uppercase font-mono">{post.platform}</span>
                <button
                  onClick={() => handleCopy(post.text, `post-${idx}`)}
                  className="flex items-center gap-1 text-[11px] font-mono text-[#9ca3af] hover:text-white"
                >
                  {copiedText === `post-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === `post-${idx}` ? 'Copied' : 'Copy Post'}</span>
                </button>
              </div>

              <h4 className="text-xs font-bold text-[#e0e6ed]">{post.title}</h4>
              <pre className="p-3 bg-black/60 border border-[#ffffff10] rounded-lg text-[11px] font-mono text-[#9ca3af] whitespace-pre-wrap leading-relaxed">
                {post.text}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Snapshot Inspector Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel max-w-4xl w-full p-6 border-[#00f0ff44] space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#ffffff1a] pb-4">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono px-2.5 py-1 rounded border font-bold uppercase ${selectedSnapshot.accentColor}`}>
                  {selectedSnapshot.badge}
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#e0e6ed]">{selectedSnapshot.title}</h3>
                  <p className="text-xs text-[#9ca3af] font-mono">{selectedSnapshot.platform} • {selectedSnapshot.version}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSnapshot(null)} className="text-[#9ca3af] hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              <div className="rounded-xl overflow-hidden border border-[#ffffff20] bg-black">
                <img
                  src={selectedSnapshot.imageUrl}
                  alt={selectedSnapshot.title}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[500px] object-cover"
                />
              </div>

              <div className="p-4 bg-[#00000050] border border-[#ffffff10] rounded-xl space-y-2 text-xs">
                <span className="font-bold text-[#00f0ff] uppercase tracking-wider block">Snapshot Specifications</span>
                <p className="text-[#9ca3af] leading-relaxed">{selectedSnapshot.description}</p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {selectedSnapshot.highlights.map((h, i) => (
                    <span key={i} className="px-2.5 py-1 bg-black/60 border border-[#00f0ff33] text-[#00f0ff] font-mono rounded-md text-[11px]">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#ffffff1a] flex items-center justify-between">
              <button
                onClick={() => handleCopy(selectedSnapshot.imageUrl, 'modal-copy')}
                className="px-4 py-2 bg-[#00000060] border border-[#ffffff20] text-[#e0e6ed] font-bold text-xs rounded-xl hover:bg-[#ffffff10] flex items-center gap-2 font-mono"
              >
                {copiedText === 'modal-copy' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText === 'modal-copy' ? 'CDN Link Copied' : 'Copy High-Res Asset URL'}</span>
              </button>

              <button
                onClick={() => setSelectedSnapshot(null)}
                className="px-4 py-2 bg-[#00f0ff] text-black font-bold text-xs rounded-xl hover:bg-[#00c0cc]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
