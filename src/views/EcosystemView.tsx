import { useState, useEffect } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Zap, 
  Gift, 
  HardDrive, 
  ShoppingBag, 
  Smartphone, 
  Activity, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Award, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight,
  UserCheck,
  TrendingUp,
  Layers,
  BookOpen
} from 'lucide-react';
import { createLedgerBlock } from '../lib/ledgerService';
import { getAccessToken, loginWithGoogle, auth } from '../firebase';
import { createDriveTextFile } from '../lib/driveService';

interface RewardItem {
  id: string;
  title: string;
  category: 'Store Coupon' | 'Pro Perk' | 'Digital Asset';
  cost: number;
  description: string;
  code?: string;
  redeemed?: boolean;
}

export default function EcosystemView() {
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('aether_ecosystem_points');
    return saved ? parseInt(saved, 10) : 1450;
  });

  const [claimedActivities, setClaimedActivities] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('aether_claimed_activities');
    return saved ? JSON.parse(saved) : {};
  });

  const [rewards, setRewards] = useState<RewardItem[]>([
    {
      id: 'rew-01',
      title: '15% Off Aetherium Cyber Store',
      category: 'Store Coupon',
      cost: 1000,
      description: 'Redeemable on Faraday Hoodies, CyberDecks, or AR Visors at aetheriumnexus.store.',
    },
    {
      id: 'rew-02',
      title: 'Cognitive Gateway Pro Token Pass',
      category: 'Pro Perk',
      cost: 1200,
      description: 'Unlocks 100k token context window and sycophancy neural filter on mobile app.',
    },
    {
      id: 'rew-03',
      title: 'RE-ALITY 6-Skin Physics Preset Vault',
      category: 'Digital Asset',
      cost: 1800,
      description: 'High-precision rugby ellipsoid prolate tether configuration file for Nexus Observer.',
    },
    {
      id: 'rew-04',
      title: 'Quantum Core Holographic License',
      category: 'Digital Asset',
      cost: 2500,
      description: 'Verified cryptographic ownership certificate for Aetherium Quantum Processors.',
    }
  ]);

  const [activeSyncing, setActiveSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(auth.currentUser?.email || 'emergenceofone@gmail.com');

  useEffect(() => {
    localStorage.setItem('aether_ecosystem_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('aether_claimed_activities', JSON.stringify(claimedActivities));
  }, [claimedActivities]);

  const handleEarnPoints = async (activityId: string, amount: number, title: string) => {
    if (claimedActivities[activityId]) return;

    const newPoints = points + amount;
    setPoints(newPoints);
    setClaimedActivities(prev => ({ ...prev, [activityId]: true }));

    // Record event in Ledger
    try {
      await createLedgerBlock(
        'Arcade City',
        'Daystrom',
        'Ecosystem Sync',
        `Aether Points Earned: +${amount} PTS (${title})`,
        `User ${userEmail} completed ecosystem sync task "${title}". Balance updated to ${newPoints} Aether Points.`
      );
    } catch (e) {
      console.warn('Failed to register ledger block for points:', e);
    }
  };

  const handleRedeemReward = async (reward: RewardItem) => {
    if (points < reward.cost) {
      alert(`Insufficient Aether Points! You need ${reward.cost - points} more PTS.`);
      return;
    }

    const promoCode = `AETHER-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`;
    const newPoints = points - reward.cost;
    setPoints(newPoints);

    setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, redeemed: true, code: promoCode } : r));

    // Create block in Ledger
    try {
      await createLedgerBlock(
        'Sky Metropolis',
        'Sentinel',
        'Economic Feedback',
        `Reward Redeemed: ${reward.title}`,
        `Claimed reward code ${promoCode} for ${reward.cost} PTS. Target item: ${reward.title}. User balance: ${newPoints} PTS.`
      );
    } catch (e) {
      console.warn('Ledger recording error:', e);
    }

    // Auto export reward certificate to Google Drive if connected
    let token = getAccessToken();
    if (token) {
      try {
        await createDriveTextFile(
          token,
          `Aetherium_Reward_Voucher_${reward.id}.md`,
          `# Aetherium Ecosystem Reward Certificate\n\n- **Item:** ${reward.title}\n- **Voucher Code:** \`${promoCode}\`\n- **Date:** ${new Date().toISOString()}\n- **Redeemer:** ${userEmail}\n- **Ecosystem Node:** Sky Metropolis / Arcade City\n\nPresent this code at https://aetherium-store.ai.studio/ or in the Cognitive Gateway mobile app to activate.`,
          'text/markdown'
        );
      } catch (e) {
        console.warn('Drive voucher backup notice:', e);
      }
    }
  };

  const handleFullEcosystemSync = async () => {
    setActiveSyncing(true);
    setSyncStatus('Initiating OAuth 2.0 Identity Handshake across 3 Nodes...');

    setTimeout(async () => {
      setSyncStatus('Polling RE-ALITY Physics Engine 60Hz Telemetry & Store Cloudflare Edge...');
      
      setTimeout(async () => {
        setSyncStatus('Syncing Aether Points Balance with Firebase & Ledger Chain...');
        
        // Add 500 PTS ecosystem sync bonus if not claimed
        if (!claimedActivities['ecosystem-sso-sync']) {
          setPoints(p => p + 500);
          setClaimedActivities(prev => ({ ...prev, ['ecosystem-sso-sync']: true }));
        }

        try {
          await createLedgerBlock(
            'Patriarch Council',
            'Sage',
            'Ecosystem Sync',
            'Tri-Node Platform Synchronization Completed',
            `Validated active status across Cognitive Gateway (Mobile), Nexus Observer (Physics Engine), and Aetherium Store (Cloudflare Edge). SSO Handshake confirmed for ${userEmail}.`
          );
        } catch (e) {
          console.error(e);
        }

        setSyncStatus('Ecosystem Synchronized! All 3 platform hubs linked successfully.');
        setActiveSyncing(false);
      }, 1000);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 border-[#00f0ff33] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#00f0ff1a] border border-[#00f0ff4d] rounded-2xl text-[#00f0ff]">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-widest uppercase text-[#e0e6ed]">
                Ecosystem Hub & Rewards
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 uppercase">
                Unified SSO Active
              </span>
            </div>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              Cross-Platform Integration for Cognitive Gateway, Nexus Observer & Cyber Store
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#00000050] border border-[#ffffff15] p-3 rounded-2xl">
          <div className="text-right">
            <div className="text-[10px] text-[#9ca3af] uppercase font-mono tracking-wider">Aether Points Balance</div>
            <div className="text-2xl font-black text-[#00f0ff] font-mono flex items-center justify-end gap-1.5">
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>{points.toLocaleString()} PTS</span>
            </div>
          </div>
          <button
            onClick={handleFullEcosystemSync}
            disabled={activeSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00f0ff] text-black font-bold text-xs hover:bg-[#00c0cc] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${activeSyncing ? 'animate-spin' : ''}`} />
            <span>Sync All Nodes</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{syncStatus}</span>
          </div>
          <button onClick={() => setSyncStatus(null)} className="text-[#9ca3af] hover:text-white">✕</button>
        </div>
      )}

      {/* Platform Status Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#9ca3af] mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00f0ff]" /> Connected Platform Nodes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Cognitive Gateway */}
          <div className="glass-panel p-5 flex flex-col justify-between border-t-2 border-t-[#00f0ff] space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-[#00f0ff15] text-[#00f0ff] rounded-lg">
                  <Smartphone className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  Mobile Live
                </span>
              </div>
              <h3 className="text-base font-bold text-[#e0e6ed]">Cognitive Gateway</h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Mobile AI prompt optimizer featuring elegance coefficient calculations, token reduction, and gamification.
              </p>
            </div>

            <div className="pt-3 border-t border-[#ffffff10] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#9ca3af] font-mono">SDK: Expo v54 / tRPC</span>
              <a
                href="https://aethergate-stv5talj.manus.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00f0ff] hover:underline flex items-center gap-1 font-mono"
              >
                Launch <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Nexus Observer */}
          <div className="glass-panel p-5 flex flex-col justify-between border-t-2 border-t-purple-400 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-purple-950/40 text-purple-300 rounded-lg">
                  <Activity className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  60Hz Engine
                </span>
              </div>
              <h3 className="text-base font-bold text-[#e0e6ed]">Nexus Observer</h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                RE-ALITY Engine v0.5 prolate ellipsoid physics simulation with BLE 200Hz pedal sampling and gesture HUD.
              </p>
            </div>

            <div className="pt-3 border-t border-[#ffffff10] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#9ca3af] font-mono">Cloud Run / Drive Vault</span>
              <a
                href="https://aetherium-nexus-observer-370919990469.europe-west1.run.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:underline flex items-center gap-1 font-mono"
              >
                Launch <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Aetherium Store */}
          <div className="glass-panel p-5 flex flex-col justify-between border-t-2 border-t-amber-400 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-amber-950/40 text-amber-400 rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  Edge Storefront
                </span>
              </div>
              <h3 className="text-base font-bold text-[#e0e6ed]">Aetherium Store</h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Headless Cloudflare Edge marketplace featuring Faraday Hoodies, CyberDecks, and Quantum Core hardware.
              </p>
            </div>

            <div className="pt-3 border-t border-[#ffffff10] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#9ca3af] font-mono">Cloudflare / Shopify</span>
              <a
                href="https://aetherium-store.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 font-mono"
              >
                Marketplace <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Google NotebookLM Knowledge Core */}
          <div className="glass-panel p-5 flex flex-col justify-between border-t-2 border-t-rose-400 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-rose-950/40 text-rose-300 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  Knowledge Core
                </span>
              </div>
              <h3 className="text-base font-bold text-[#e0e6ed]">NotebookLM Vault</h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Google NotebookLM interactive research hub containing Aetherium Codex source grounding and audio overviews.
              </p>
            </div>

            <div className="pt-3 border-t border-[#ffffff10] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#9ca3af] font-mono">NotebookLM Shared</span>
              <a
                href="https://notebooklm.google.com/notebook/dd603037-a662-411c-8173-570f33b72306?utm_source=nlmm_share"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-300 hover:underline flex items-center gap-1 font-mono"
              >
                Open Vault <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Earn Points Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 glass-panel p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#9ca3af] flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Earn Aether Points
          </h2>

          <div className="space-y-3 text-xs">
            {[
              {
                id: 'ecosystem-sso-sync',
                title: 'Cross-Platform Single Sign-On Verification',
                desc: 'Confirm OAuth 2.0 identity link between Gateway, Observer, and Store.',
                amount: 500,
              },
              {
                id: 'cognitive-telemetry-push',
                title: 'Transmit Prompt Optimization Telemetry',
                desc: 'Sync elegance score log from Cognitive Gateway to Ledger.',
                amount: 250,
              },
              {
                id: 'nexus-physics-pulse',
                title: 'Sync Nexus 60Hz Physics Ellipsoid Trace',
                desc: 'Stream rugby ball energy mechanics to Google Drive Vault.',
                amount: 300,
              },
              {
                id: 'codex-streak-claim',
                title: '7-Day Codex Master Contemplation Streak',
                desc: 'Read and reflect on Patriarch Vessel chapters daily.',
                amount: 200,
              },
              {
                id: 'notebooklm-knowledge-sync',
                title: 'Google NotebookLM Research Vault Linking',
                desc: 'Connect NotebookLM source grounding notebook for Codex knowledge synthesis.',
                amount: 350,
              }
            ].map((act) => {
              const isClaimed = claimedActivities[act.id];
              return (
                <div
                  key={act.id}
                  className="p-3.5 bg-[#00000040] border border-[#ffffff10] rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-[#e0e6ed]">{act.title}</h4>
                    <p className="text-[11px] text-[#9ca3af]">{act.desc}</p>
                  </div>

                  <button
                    onClick={() => handleEarnPoints(act.id, act.amount, act.title)}
                    disabled={isClaimed}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-all ${
                      isClaimed
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 cursor-default'
                        : 'bg-amber-400 text-black hover:bg-amber-300'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                      </>
                    ) : (
                      <>
                        +${act.amount} PTS
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Redeem Points Marketplace */}
        <div className="lg:col-span-6 glass-panel p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#9ca3af] flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#00f0ff]" /> Redeem Ecosystem Rewards
          </h2>

          <div className="space-y-3 text-xs">
            {rewards.map((rew) => (
              <div
                key={rew.id}
                className="p-3.5 bg-[#00000040] border border-[#ffffff10] rounded-xl space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[#00f0ff1a] text-[#00f0ff] border border-[#00f0ff33]">
                      {rew.category}
                    </span>
                    <h4 className="font-bold text-[#e0e6ed] mt-1">{rew.title}</h4>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-sm whitespace-nowrap">
                    {rew.cost} PTS
                  </span>
                </div>

                <p className="text-[11px] text-[#9ca3af]">{rew.description}</p>

                {rew.redeemed && rew.code ? (
                  <div className="mt-2 p-2 bg-[#00f0ff10] border border-[#00f0ff44] rounded-lg flex items-center justify-between font-mono">
                    <span className="text-[#00f0ff] font-bold">{rew.code}</span>
                    <button
                      onClick={() => copyToClipboard(rew.code!)}
                      className="text-[#9ca3af] hover:text-white flex items-center gap-1 text-[10px]"
                    >
                      {copiedCode === rew.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRedeemReward(rew)}
                    disabled={points < rew.cost}
                    className="w-full mt-1 py-1.5 rounded-lg font-bold text-xs bg-[#00f0ff] text-black hover:bg-[#00c0cc] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Redeem Reward ({rew.cost} PTS)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
