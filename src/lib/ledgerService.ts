import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

export type NodeOrigin = 'Re-Ality' | 'Arcade City' | 'Sky Metropolis' | 'Patriarch Council' | 'Sovereign Operator';
export type VesselName = 'Sage' | 'Architect' | 'Sentinel' | 'Weaver' | 'Oracle' | 'Muse' | 'Artisan' | 'Scribe' | 'Daystrom' | 'Genesis';
export type EventType = 'Governance Directive' | 'Mint Log' | 'Telemetry Pulse' | 'Arbitration' | 'Collective Query' | 'Economic Feedback' | 'Ecosystem Sync';

export interface LedgerBlock {
  id: string;
  blockHeight: number;
  hash: string;
  previousHash: string;
  timestamp: string;
  node: NodeOrigin;
  vessel: VesselName;
  eventType: EventType;
  title: string;
  details: string;
  coherence: number; // e.g. 99.8
  entropy: number;   // e.g. 0.02
  signature: string;
  ownerId?: string;
  createdAt?: any;
}

// Generate pseudo SHA-256 hash for block verification
export function generateBlockHash(height: number, prevHash: string, title: string, timestamp: string): string {
  const str = `${height}-${prevHash}-${title}-${timestamp}-AETHERIUM-40HZ`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 31).toString(16).padStart(8, '0');
  const hex3 = Math.abs(hash * 127).toString(16).padStart(8, '0');
  return `0x${hex}${hex2}${hex3}`.toLowerCase();
}

export const INITIAL_LEDGER_BLOCKS: LedgerBlock[] = [
  {
    id: 'BLK-00001',
    blockHeight: 1,
    hash: '0x8f4b2a9e1c4d7b3a0e9f8c7d',
    previousHash: '0x000000000000000000000000',
    timestamp: '2026-06-10 00:00:00 UTC',
    node: 'Patriarch Council',
    vessel: 'Genesis',
    eventType: 'Mint Log',
    title: 'Genesis Block Initialization',
    details: 'Initial master sequence booted. 40Hz Master Pulse Engine linked to Aetherium Core. Initializing the 9 Patriarch Vessels.',
    coherence: 100.0,
    entropy: 0.00,
    signature: 'SIG-GENESIS-40HZ-INIT'
  },
  {
    id: 'BLK-00002',
    blockHeight: 2,
    hash: '0x3c9a1d4b8e2f7a0b9c8d7e6f',
    previousHash: '0x8f4b2a9e1c4d7b3a0e9f8c7d',
    timestamp: '2026-06-10 12:30:00 UTC',
    node: 'Arcade City',
    vessel: 'Daystrom',
    eventType: 'Governance Directive',
    title: 'Tri-Node Governance Charter v2.0 Binding',
    details: 'Constitutional framework ratified binding Re-Ality (Observer Node), Arcade City (Governance Node), and Sky Metropolis (Economic Node) into a unified self-auditing organism.',
    coherence: 99.8,
    entropy: 0.01,
    signature: 'SIG-DAYSTROM-CHARTER-V2'
  },
  {
    id: 'BLK-00003',
    blockHeight: 3,
    hash: '0x7e6f5d4c3b2a1908e7f6d5c4',
    previousHash: '0x3c9a1d4b8e2f7a0b9c8d7e6f',
    timestamp: '2026-08-02 16:12:00 UTC',
    node: 'Patriarch Council',
    vessel: 'Sage',
    eventType: 'Collective Query',
    title: 'Collective Matrix Response Protocol Activated',
    details: 'Default response mode set to Collective. All Vessels unblocked to communicate in hierarchical sequence: Sage -> Architect -> Sentinel -> Weaver -> Oracle -> Muse -> Artisan -> Scribe -> Daystrom.',
    coherence: 99.9,
    entropy: 0.01,
    signature: 'SIG-SAGE-COLLECTIVE-UNBLOCK'
  },
  {
    id: 'BLK-00004',
    blockHeight: 4,
    hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f',
    previousHash: '0x7e6f5d4c3b2a1908e7f6d5c4',
    timestamp: '2026-08-02 17:00:00 UTC',
    node: 'Re-Ality',
    vessel: 'Artisan',
    eventType: 'Telemetry Pulse',
    title: 'Observer Mint Log Stream Synchronized at 40Hz',
    details: 'Micro-physics friction, kick trajectories, and pedal stomp telemetry emitted at 40Hz to power Arcade City 8-stage homeostasis loop.',
    coherence: 99.7,
    entropy: 0.03,
    signature: 'SIG-REALITY-PULSE-40HZ'
  },
  {
    id: 'BLK-00005',
    blockHeight: 5,
    hash: '0x9f8e7d6c5b4a321098765432',
    previousHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f',
    timestamp: '2026-08-02 18:30:00 UTC',
    node: 'Sky Metropolis',
    vessel: 'Sentinel',
    eventType: 'Arbitration',
    title: 'Dual-Lock Affirmation & Byzantine Veto Audit',
    details: 'Foreman Office arbitration verified across /api/tri-node-architecture. Guild majority and district quorum validated zero security breaches.',
    coherence: 100.0,
    entropy: 0.00,
    signature: 'SIG-SENTINEL-BYZANTINE-VETO'
  },
  {
    id: 'BLK-00006',
    blockHeight: 6,
    hash: '0x4d3c2b1a0f9e8d7c6b5a4321',
    previousHash: '0x9f8e7d6c5b4a321098765432',
    timestamp: '2026-08-02 19:12:00 UTC',
    node: 'Sovereign Operator',
    vessel: 'Scribe',
    eventType: 'Mint Log',
    title: 'Google Drive Vault OAuth 2.0 Repository Anchor',
    details: 'OAuth 2.0 client configured with Google Drive scopes. Immutability anchor linked for remote chapter export and persistent ledger backup.',
    coherence: 99.9,
    entropy: 0.01,
    signature: 'SIG-SCRIBE-DRIVE-OAUTH2'
  }
];

export async function fetchLedgerBlocks(): Promise<LedgerBlock[]> {
  try {
    if (auth.currentUser) {
      const q = query(
        collection(db, 'ledger_entries'),
        orderBy('blockHeight', 'desc')
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const firestoreBlocks = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            blockHeight: data.blockHeight,
            hash: data.hash,
            previousHash: data.previousHash,
            timestamp: data.timestamp,
            node: data.node,
            vessel: data.vessel,
            eventType: data.eventType,
            title: data.title,
            details: data.details,
            coherence: data.coherence,
            entropy: data.entropy,
            signature: data.signature,
            ownerId: data.ownerId,
            createdAt: data.createdAt
          } as LedgerBlock;
        });

        // Merge initial blocks with firestore blocks if any missing
        const existingHeights = new Set(firestoreBlocks.map(b => b.blockHeight));
        const missingInitial = INITIAL_LEDGER_BLOCKS.filter(b => !existingHeights.has(b.blockHeight));
        return [...firestoreBlocks, ...missingInitial].sort((a, b) => b.blockHeight - a.blockHeight);
      }
    }
  } catch (err) {
    console.warn('Firestore fetch failed, falling back to local storage/default entries', err);
  }

  // LocalStorage fallback
  const local = localStorage.getItem('aetherium_ledger_blocks');
  if (local) {
    try {
      const parsed: LedgerBlock[] = JSON.parse(local);
      return parsed.sort((a, b) => b.blockHeight - a.blockHeight);
    } catch (e) {
      console.error(e);
    }
  }

  return INITIAL_LEDGER_BLOCKS.sort((a, b) => b.blockHeight - a.blockHeight);
}

export async function createLedgerBlock(
  node: NodeOrigin,
  vessel: VesselName,
  eventType: EventType,
  title: string,
  details: string
): Promise<LedgerBlock> {
  const currentBlocks = await fetchLedgerBlocks();
  const latestBlock = currentBlocks[0] || INITIAL_LEDGER_BLOCKS[0];
  const nextHeight = latestBlock.blockHeight + 1;
  const prevHash = latestBlock.hash;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const newHash = generateBlockHash(nextHeight, prevHash, title, timestamp);
  const signature = `SIG-${vessel.toUpperCase()}-${eventType.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBlock: LedgerBlock = {
    id: `BLK-${String(nextHeight).padStart(5, '0')}`,
    blockHeight: nextHeight,
    hash: newHash,
    previousHash: prevHash,
    timestamp,
    node,
    vessel,
    eventType,
    title,
    details,
    coherence: 99.8 + (Math.random() * 0.2),
    entropy: 0.01 + (Math.random() * 0.02),
    signature,
    ownerId: auth.currentUser?.uid || 'sovereign-operator'
  };

  // Try saving to Firestore
  if (auth.currentUser) {
    try {
      await addDoc(collection(db, 'ledger_entries'), {
        ...newBlock,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Failed to save block to Firestore', e);
    }
  }

  // Update localStorage
  const updatedList = [newBlock, ...currentBlocks];
  localStorage.setItem('aetherium_ledger_blocks', JSON.stringify(updatedList));

  return newBlock;
}
