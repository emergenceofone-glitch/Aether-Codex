import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Loader2 } from 'lucide-react';
import { askAntigravity } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AntigravityTerminal() {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'agent'; content: string; steps?: any[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [interactionId, setInteractionId] = useState<string | undefined>();
  const [environmentId, setEnvironmentId] = useState<string | undefined>();
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMsg = prompt.trim();
    setPrompt('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await askAntigravity(userMsg, interactionId);
      
      if (res.interactionId) setInteractionId(res.interactionId);
      if (res.environmentId) setEnvironmentId(res.environmentId);
      
      setHistory(prev => [...prev, { 
        role: 'agent', 
        content: res.text,
        steps: res.steps
      }]);
    } catch (err: any) {
      setHistory(prev => [...prev, { role: 'agent', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col glass-panel overflow-hidden">
      <div className="bg-black/50 border-b border-[#00f0ff]/20 p-4 flex items-center gap-3">
        <Terminal className="text-[#00f0ff]" />
        <h2 className="text-[#00f0ff] font-bold tracking-wider">ANTIGRAVITY SDK TERMINAL</h2>
        {environmentId && (
          <span className="ml-auto text-xs text-[#ff9900] bg-[#ff9900]/10 px-2 py-1 rounded">
            ENV: {environmentId.substring(0, 8)}...
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#9ca3af] flex-col gap-4">
            <Terminal size={48} className="opacity-20" />
            <p>Antigravity managed agent sandbox ready.</p>
            <p className="text-sm">Can execute code, modify files, and browse the web.</p>
          </div>
        ) : (
          history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded p-4 ${
                msg.role === 'user' 
                  ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-white' 
                  : 'bg-black/40 border border-[#ff9900]/20 text-[#e0e6ed]'
              }`}>
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="space-y-4">
                    {/* Render tool calls if available */}
                    {msg.steps && msg.steps.map((step: any, stepIdx: number) => {
                      if (step.type === 'code_execution_call') {
                        return (
                          <div key={stepIdx} className="bg-black/60 rounded border border-[#ff9900]/30 p-2 text-xs font-mono text-[#ff9900]">
                            <div className="font-bold border-b border-[#ff9900]/30 pb-1 mb-1">Code Execution</div>
                            <pre className="overflow-x-auto p-1">{step.code_execution_call?.code}</pre>
                          </div>
                        );
                      } else if (step.type === 'code_execution_result') {
                        return (
                          <div key={stepIdx} className="bg-black/60 rounded border border-green-500/30 p-2 text-xs font-mono text-green-400">
                            <div className="font-bold border-b border-green-500/30 pb-1 mb-1">Execution Result</div>
                            <pre className="overflow-x-auto p-1">{step.code_execution_result?.output}</pre>
                          </div>
                        );
                      } else if (step.type === 'function_call') {
                         return (
                          <div key={stepIdx} className="bg-black/60 rounded border border-blue-500/30 p-2 text-xs font-mono text-blue-400">
                            <div className="font-bold border-b border-blue-500/30 pb-1 mb-1">Tool Call: {step.function_call?.name}</div>
                            <pre className="overflow-x-auto p-1">{JSON.stringify(step.function_call?.arguments, null, 2)}</pre>
                          </div>
                        );
                      }
                      return null;
                    })}
                    
                    <div className="markdown-body text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-black/40 border border-[#ff9900]/20 rounded p-4 flex items-center gap-2 text-[#ff9900]">
              <Loader2 className="animate-spin" size={16} />
              <span>Agent processing...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 bg-black/30 border-t border-[#00f0ff]/20">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Command the Antigravity agent..."
            className="flex-1 bg-black/50 border border-[#00f0ff]/30 rounded-full py-3 px-6 text-white focus:outline-none focus:border-[#00f0ff] transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="bg-[#00f0ff] text-black rounded-full p-3 hover:bg-[#00c0cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Play size={20} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
