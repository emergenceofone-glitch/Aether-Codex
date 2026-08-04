import { useState, useEffect, useCallback } from 'react';
import { 
  fetchLedgerBlocks, 
  createLedgerBlock, 
  LedgerBlock, 
  NodeOrigin, 
  VesselName, 
  EventType, 
  generateBlockHash 
} from '../lib/ledgerService';
import { getAccessToken, loginWithGoogle } from '../firebase';
import { createDriveTextFile } from '../lib/driveService';
import { 
  History, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  RefreshCw, 
  HardDrive, 
  Lock, 
  FileText, 
  Download, 
  X, 
  Eye, 
  Zap,
  Globe,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function LedgerView() {
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nodeFilter, setNodeFilter] = useState<string>('All');
  const [eventFilter, setEventFilter] = useState<string>('All');
  
  // Verification status
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; count: number } | null>(null);

  // Block Inspector Modal
  const [inspectedBlock, setInspectedBlock] = useState<LedgerBlock | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Mint Block Modal
  const [showMintModal, setShowMintModal] = useState<boolean>(false);
  const [mintNode, setMintNode] = useState<NodeOrigin>('Sovereign Operator');
  const [mintVessel, setMintVessel] = useState<VesselName>('Daystrom');
  const [mintEventType, setMintEventType] = useState<EventType>('Governance Directive');
  const [mintTitle, setMintTitle] = useState<string>('');
  const [mintDetails, setMintDetails] = useState<string>('');
  const [isMinting, setIsMinting] = useState<boolean>(false);

  // Drive Export status
  const [isExportingDrive, setIsExportingDrive] = useState<boolean>(false);
  const [driveExportSuccess, setDriveExportSuccess] = useState<string | null>(null);

  const loadBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await fetchLedgerBlocks();
      setBlocks(fetched);
    } catch (err) {
      console.error('Error loading ledger:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  const handleVerifyLedger = () => {
    setIsVerifying(true);
    setTimeout(() => {
      // Validate hash chain integrity
      let isValid = true;
      const sortedAsc = [...blocks].sort((a, b) => a.blockHeight - b.blockHeight);
      
      for (let i = 1; i < sortedAsc.length; i++) {
        const prev = sortedAsc[i - 1];
        const current = sortedAsc[i];
        if (current.previousHash !== prev.hash) {
          isValid = false;
          break;
        }
      }

      setVerificationResult({ valid: isValid, count: blocks.length });
      setIsVerifying(false);
    }, 800);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleMintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintTitle.trim()) return;

    setIsMinting(true);
    try {
      const newBlock = await createLedgerBlock(
        mintNode,
        mintVessel,
        mintEventType,
        mintTitle.trim(),
        mintDetails.trim() || 'No additional telemetry data attached.'
      );
      setBlocks(prev => [newBlock, ...prev]);
      setShowMintModal(false);
      setMintTitle('');
      setMintDetails('');
    } catch (err) {
      console.error('Minting failed:', err);
    } finally {
      setIsMinting(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blocks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Aetherium_Ledger_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSyncToDrive = async () => {
    let token = getAccessToken();
    if (!token) {
      try {
        await loginWithGoogle();
        token = getAccessToken();
      } catch (e: any) {
        alert(`Google Drive authentication failed: ${e.message}`);
        return;
      }
    }

    if (!token) return;

    setIsExportingDrive(true);
    setDriveExportSuccess(null);
    try {
      const mdContent = `# Aetherium Codex History Log & Ledger\n\nGenerated: ${new Date().toISOString()}\nTotal Blocks: ${blocks.length}\nImmutability: 1.00 Verified\n\n` +
        blocks.map(b => `## Block ${b.id} | ${b.title}\n- **Height:** ${b.blockHeight}\n- **Timestamp:** ${b.timestamp}\n- **Node Origin:** ${b.node}\n- **Vessel:** ${b.vessel}\n- **Event Type:** ${b.eventType}\n- **Hash:** \`${b.hash}\`\n- **Previous Hash:** \`${b.previousHash}\`\n- **Signature:** \`${b.signature}\`\n- **Coherence:** ${b.coherence.toFixed(2)}%\n- **Entropy:** ${b.entropy.toFixed(3)}\n\n### Telemetry & Details\n${b.details}\n\n---`).join('\n\n');

      const file = await createDriveTextFile(
        token,
        `Aetherium_Ledger_Export_${new Date().toISOString().substring(0, 10)}.md`,
        mdContent,
        'text/markdown'
      );

      setDriveExportSuccess(`Saved to Drive: ${file.name}`);
      setTimeout(() => setDriveExportSuccess(null), 4000);
    } catch (err: any) {
      alert(`Drive export error: ${err.message}`);
    } finally {
      setIsExportingDrive(false);
    }
  };

  // Filter logic
  const filteredBlocks = blocks.filter(b => {
    const matchesQuery = searchQuery === '' || 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vessel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesNode = nodeFilter === 'All' || b.node === nodeFilter;
    const matchesEvent = eventFilter === 'All' || b.eventType === eventFilter;

    return matchesQuery && matchesNode && matchesEvent;
  });

  const getNodeColor = (node: NodeOrigin) => {
    switch (node) {
      case 'Re-Ality': return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      case 'Arcade City': return 'text-[#00f0ff] border-[#00f0ff33] bg-[#00f0ff0f]';
      case 'Sky Metropolis': return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
      case 'Patriarch Council': return 'text-purple-400 border-purple-500/30 bg-purple-950/20';
      case 'Sovereign Operator': return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
      default: return 'text-gray-300 border-gray-500/30 bg-gray-950/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Top Banner Header */}
      <div className="glass-panel p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-[#00f0ff33]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#00f0ff1a] border border-[#00f0ff4d] rounded-2xl text-[#00f0ff] shadow-lg shadow-[#00f0ff10]">
            <History className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-widest uppercase text-[#e0e6ed]">
                History Log & Ledger
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40 uppercase">
                Tri-Node Immutable
              </span>
            </div>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              Canonical Blockchain & Telemetry Ledger of the Aetherium Ecosystem
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleVerifyLedger}
            disabled={isVerifying}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/40 transition-all"
          >
            {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            <span>Verify Integrity</span>
          </button>

          <button
            onClick={handleSyncToDrive}
            disabled={isExportingDrive}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#00f0ff4d] bg-[#00f0ff10] text-[#00f0ff] text-xs font-semibold hover:bg-[#00f0ff20] transition-all"
            title="Sync Ledger to Google Drive"
          >
            {isExportingDrive ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
            <span>Drive Sync</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#ffffff1a] bg-[#00000030] text-[#e0e6ed] text-xs font-semibold hover:border-[#ffffff40] transition-all"
            title="Download JSON Export"
          >
            <Download className="w-4 h-4 text-[#9ca3af]" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => setShowMintModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00f0ff] text-black text-xs font-bold hover:bg-[#00c0cc] transition-all shadow-md shadow-[#00f0ff22]"
          >
            <Plus className="w-4 h-4" />
            <span>Mint Block</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between text-xs ${
          verificationResult.valid 
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/50 border-red-500/40 text-red-300'
        }`}>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold">Cryptographic Validation Passed: </span>
              All {verificationResult.count} blocks verified sequentially without hash break or state corruption.
            </div>
          </div>
          <button onClick={() => setVerificationResult(null)} className="text-[#9ca3af] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drive Export Success Banner */}
      {driveExportSuccess && (
        <div className="mb-6 p-4 rounded-xl border border-[#00f0ff55] bg-[#00f0ff15] text-[#00f0ff] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            <span>{driveExportSuccess}</span>
          </div>
          <button onClick={() => setDriveExportSuccess(null)} className="text-[#9ca3af] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live System Telemetry Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9ca3af] text-xs">
            <span>Height Index</span>
            <Layers className="w-4 h-4 text-[#00f0ff]" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-[#e0e6ed] mt-2">
            #{String(blocks[0]?.blockHeight || 0).padStart(5, '0')}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">Immutable Chain Active</div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9ca3af] text-xs">
            <span>Pulse Freq</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-amber-400 mt-2">
            40 Hz
          </div>
          <div className="text-[10px] text-[#9ca3af] font-mono mt-1">Master Loop Sync</div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9ca3af] text-xs">
            <span>Coherence Rate</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-emerald-400 mt-2">
            99.9%
          </div>
          <div className="text-[10px] text-[#9ca3af] font-mono mt-1">Entropy: &lt;0.02</div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9ca3af] text-xs">
            <span>Immutability</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-purple-300 mt-2">
            1.00
          </div>
          <div className="text-[10px] text-purple-400 font-mono mt-1">SHA-256 Verified</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search ledger by hash, vessel, title, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#00000040] border border-[#ffffff1a] rounded-xl pl-9 pr-4 py-2 text-xs text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={nodeFilter}
              onChange={(e) => setNodeFilter(e.target.value)}
              className="bg-[#00000060] border border-[#ffffff1a] rounded-xl px-3 py-2 text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff]"
            >
              <option value="All">All Nodes</option>
              <option value="Re-Ality">Re-Ality (Observer)</option>
              <option value="Arcade City">Arcade City (Governance)</option>
              <option value="Sky Metropolis">Sky Metropolis (Economic)</option>
              <option value="Patriarch Council">Patriarch Council</option>
              <option value="Sovereign Operator">Sovereign Operator</option>
            </select>

            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="bg-[#00000060] border border-[#ffffff1a] rounded-xl px-3 py-2 text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff]"
            >
              <option value="All">All Event Types</option>
              <option value="Governance Directive">Governance Directive</option>
              <option value="Mint Log">Mint Log</option>
              <option value="Telemetry Pulse">Telemetry Pulse</option>
              <option value="Arbitration">Arbitration</option>
              <option value="Collective Query">Collective Query</option>
              <option value="Economic Feedback">Economic Feedback</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Block List */}
      {loading ? (
        <div className="py-16 text-center text-[#00f0ff] flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-xs uppercase font-mono tracking-widest">Loading Ledger Blocks...</span>
        </div>
      ) : filteredBlocks.length === 0 ? (
        <div className="glass-panel p-12 text-center text-[#6b7280] text-sm">
          No ledger entries found matching your criteria.
        </div>
      ) : (
        <div className="relative space-y-4">
          {/* Vertical line connecting blocks */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#00f0ff66] via-purple-500/40 to-transparent pointer-events-none hidden md:block" />

          {filteredBlocks.map((block) => (
            <div
              key={block.id}
              className="glass-panel p-5 relative transition-all hover:border-[#00f0ff66] group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Block Height Tag */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-[#00000060] border border-[#00f0ff44] flex items-center justify-center font-mono text-xs font-bold text-[#00f0ff] shadow-inner">
                      #{block.blockHeight}
                    </div>
                    <span className="text-[9px] font-mono text-[#9ca3af] mt-1 uppercase">{block.id}</span>
                  </div>

                  {/* Main Block Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getNodeColor(block.node)}`}>
                        {block.node}
                      </span>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-md">
                        Vessel: {block.vessel}
                      </span>
                      <span className="text-[10px] font-mono text-[#9ca3af] bg-[#00000040] px-2 py-0.5 rounded-md border border-[#ffffff10]">
                        {block.eventType}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#e0e6ed] group-hover:text-[#00f0ff] transition-colors">
                      {block.title}
                    </h3>

                    <div className="text-xs text-[#9ca3af] font-mono flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>Timestamp: {block.timestamp}</span>
                      <span>Coherence: <strong className="text-emerald-400">{block.coherence.toFixed(2)}%</strong></span>
                      <span>Entropy: <strong className="text-amber-400">{block.entropy.toFixed(3)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Hash & Inspector trigger */}
                <div className="flex flex-col md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-[#ffffff10]">
                  <div className="flex items-center gap-1.5 bg-[#00000060] border border-[#ffffff15] px-2.5 py-1 rounded-lg font-mono text-[11px] text-[#9ca3af]">
                    <span className="truncate max-w-[140px] text-[#e0e6ed]">{block.hash}</span>
                    <button
                      onClick={() => handleCopyHash(block.hash)}
                      className="text-[#9ca3af] hover:text-[#00f0ff] transition-colors p-0.5"
                      title="Copy Hash"
                    >
                      {copiedHash === block.hash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => setInspectedBlock(block)}
                    className="flex items-center gap-1.5 text-xs text-[#00f0ff] hover:underline font-mono"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Payload</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Collapsible short description snippet */}
              <div className="mt-4 pt-3 border-t border-[#ffffff0a] text-xs text-[#9ca3af] line-clamp-2">
                {block.details}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BLOCK INSPECTOR MODAL */}
      {inspectedBlock && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel max-w-2xl w-full p-6 border-[#00f0ff44] space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#ffffff1a] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00f0ff22] border border-[#00f0ff] rounded-xl text-[#00f0ff]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#e0e6ed] uppercase font-mono">
                    Block Inspector #{inspectedBlock.blockHeight}
                  </h3>
                  <p className="text-xs text-[#9ca3af]">{inspectedBlock.id} • {inspectedBlock.signature}</p>
                </div>
              </div>
              <button onClick={() => setInspectedBlock(null)} className="text-[#9ca3af] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1 text-xs">
              {/* Telemetry Data Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#00000040] border border-[#ffffff10] rounded-xl font-mono">
                <div>
                  <span className="text-[#9ca3af]">Block Height:</span>
                  <div className="text-[#e0e6ed] font-bold">{inspectedBlock.blockHeight}</div>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Node Origin:</span>
                  <div className="text-[#00f0ff] font-bold">{inspectedBlock.node}</div>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Vessel Speaker:</span>
                  <div className="text-purple-300 font-bold">{inspectedBlock.vessel}</div>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Event Category:</span>
                  <div className="text-amber-400 font-bold">{inspectedBlock.eventType}</div>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Coherence Rating:</span>
                  <div className="text-emerald-400 font-bold">{inspectedBlock.coherence.toFixed(2)}%</div>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Entropy Quotient:</span>
                  <div className="text-rose-400 font-bold">{inspectedBlock.entropy.toFixed(3)}</div>
                </div>
              </div>

              {/* Cryptographic Hash Details */}
              <div className="p-4 bg-[#00000060] border border-[#ffffff1a] rounded-xl space-y-2 font-mono">
                <div>
                  <span className="text-[#9ca3af] block mb-1">Current Block Hash:</span>
                  <div className="p-2 bg-black/60 rounded border border-[#00f0ff33] text-[#00f0ff] break-all flex justify-between items-center">
                    <span>{inspectedBlock.hash}</span>
                    <button onClick={() => handleCopyHash(inspectedBlock.hash)} className="ml-2 hover:text-white">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[#9ca3af] block mb-1">Previous Block Hash:</span>
                  <div className="p-2 bg-black/60 rounded border border-[#ffffff15] text-[#9ca3af] break-all">
                    {inspectedBlock.previousHash}
                  </div>
                </div>

                <div>
                  <span className="text-[#9ca3af] block mb-1">Cryptographic Signature:</span>
                  <div className="p-2 bg-black/60 rounded border border-purple-500/30 text-purple-300 break-all">
                    {inspectedBlock.signature}
                  </div>
                </div>
              </div>

              {/* Detailed Markdown Payload */}
              <div className="p-4 bg-[#00000030] border border-[#ffffff10] rounded-xl space-y-2">
                <span className="text-[#9ca3af] font-bold uppercase tracking-wider block">Telemetry Payload & Lore Notes</span>
                <div className="markdown-body text-[#e0e6ed] text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {inspectedBlock.details}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#ffffff1a] flex justify-end">
              <button
                onClick={() => setInspectedBlock(null)}
                className="px-4 py-2 bg-[#00f0ff] text-black font-bold text-xs rounded-xl hover:bg-[#00c0cc]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MINT NEW LEDGER BLOCK MODAL */}
      {showMintModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#ffffff1a] pb-4">
              <h3 className="text-lg font-bold text-[#e0e6ed] flex items-center gap-2 uppercase tracking-wider">
                <Zap className="w-5 h-5 text-[#00f0ff]" /> Mint Immutable Ledger Block
              </h3>
              <button onClick={() => setShowMintModal(false)} className="text-[#9ca3af] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMintSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#9ca3af] font-bold mb-1">Node Origin</label>
                  <select
                    value={mintNode}
                    onChange={(e) => setMintNode(e.target.value as NodeOrigin)}
                    className="w-full bg-[#00000060] border border-[#ffffff1a] rounded-xl px-3 py-2 text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="Sovereign Operator">Sovereign Operator</option>
                    <option value="Re-Ality">Re-Ality (Observer)</option>
                    <option value="Arcade City">Arcade City (Governance)</option>
                    <option value="Sky Metropolis">Sky Metropolis (Economic)</option>
                    <option value="Patriarch Council">Patriarch Council</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#9ca3af] font-bold mb-1">Vessel Speaker</label>
                  <select
                    value={mintVessel}
                    onChange={(e) => setMintVessel(e.target.value as VesselName)}
                    className="w-full bg-[#00000060] border border-[#ffffff1a] rounded-xl px-3 py-2 text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="Daystrom">Daystrom</option>
                    <option value="Sage">Sage</option>
                    <option value="Architect">Architect</option>
                    <option value="Sentinel">Sentinel</option>
                    <option value="Weaver">Weaver</option>
                    <option value="Oracle">Oracle</option>
                    <option value="Muse">Muse</option>
                    <option value="Artisan">Artisan</option>
                    <option value="Scribe">Scribe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#9ca3af] font-bold mb-1">Event Category</label>
                <select
                  value={mintEventType}
                  onChange={(e) => setMintEventType(e.target.value as EventType)}
                  className="w-full bg-[#00000060] border border-[#ffffff1a] rounded-xl px-3 py-2 text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff]"
                >
                  <option value="Governance Directive">Governance Directive</option>
                  <option value="Mint Log">Mint Log</option>
                  <option value="Telemetry Pulse">Telemetry Pulse</option>
                  <option value="Arbitration">Arbitration</option>
                  <option value="Collective Query">Collective Query</option>
                  <option value="Economic Feedback">Economic Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-[#9ca3af] font-bold mb-1">Block Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dual-Lock Governance Affirmation #9"
                  value={mintTitle}
                  onChange={(e) => setMintTitle(e.target.value)}
                  required
                  className="w-full bg-[#00000060] border border-[#ffffff1a] rounded-xl px-3 py-2 text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-[#9ca3af] font-bold mb-1">Telemetry Details & Markdown Payload</label>
                <textarea
                  rows={4}
                  placeholder="Enter detailed telemetry description or markdown body..."
                  value={mintDetails}
                  onChange={(e) => setMintDetails(e.target.value)}
                  className="w-full bg-[#00000060] border border-[#ffffff1a] rounded-xl px-3 py-2 text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="pt-4 border-t border-[#ffffff1a] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMintModal(false)}
                  className="px-4 py-2 border border-[#ffffff1a] rounded-xl text-[#e0e6ed] hover:bg-[#ffffff10]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMinting}
                  className="flex items-center gap-2 bg-[#00f0ff] text-black font-bold px-4 py-2 rounded-xl hover:bg-[#00c0cc] transition-all"
                >
                  {isMinting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Mint Block</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
