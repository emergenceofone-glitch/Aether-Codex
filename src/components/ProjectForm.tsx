import { useState } from 'react';
import { createProject, ProjectStatus } from '../lib/projectService';
import { Loader2, Plus } from 'lucide-react';

export default function ProjectForm({ onProjectCreated }: { onProjectCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('In-Progress');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsLoading(true);
    setError('');

    try {
      await createProject(title, description, status);
      setTitle('');
      setDescription('');
      setStatus('In-Progress');
      onProjectCreated();
    } catch (err) {
      setError('Failed to create project.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
      <h3 className="text-lg font-bold text-[#00f0ff]">Create New Project</h3>
      
      <div>
        <label className="block text-xs uppercase text-[#9ca3af] mb-1">Title</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-[#0a0f14] border border-[#ffffff1a] rounded px-3 py-2 text-[#e0e6ed] focus:border-[#00f0ff] outline-none"
        />
      </div>

      <div>
        <label className="block text-xs uppercase text-[#9ca3af] mb-1">Description</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full bg-[#0a0f14] border border-[#ffffff1a] rounded px-3 py-2 text-[#e0e6ed] focus:border-[#00f0ff] outline-none min-h-[100px]"
        />
      </div>

      <div>
        <label className="block text-xs uppercase text-[#9ca3af] mb-1">Initial Status</label>
        <div className="grid grid-cols-3 gap-2">
          {(['In-Progress', 'Active', 'Archived'] as ProjectStatus[]).map((state) => {
            const isSelected = status === state;
            return (
              <button
                key={state}
                type="button"
                onClick={() => setStatus(state)}
                className={`py-2 px-1 text-xs font-bold rounded border transition-all ${
                  isSelected
                    ? 'bg-[#00f0ff] border-[#00f0ff] text-black shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'bg-[#0a0f14] border-[#ffffff1a] text-[#9ca3af] hover:text-[#e0e6ed] hover:border-[#ffffff33]'
                }`}
              >
                {state}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button 
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#00f0ff] text-black py-2 rounded font-bold hover:bg-[#00c0cc] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
        Create Project
      </button>
    </form>
  );
}
