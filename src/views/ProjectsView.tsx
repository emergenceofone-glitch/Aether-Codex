import { useState, useEffect } from 'react';
import { getUserProjects, Project, ProjectStatus, updateProjectStatus } from '../lib/projectService';
import ProjectForm from '../components/ProjectForm';
import { FolderKanban, Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
  'Active': {
    color: 'text-[#4ade80] bg-[#022c22] border-[#065f46] hover:border-[#10b981]',
    bullet: 'bg-[#4ade80]'
  },
  'In-Progress': {
    color: 'text-[#fbbf24] bg-[#451a03] border-[#78350f] hover:border-[#fbbf24]',
    bullet: 'bg-[#fbbf24]'
  },
  'Archived': {
    color: 'text-[#9ca3af] bg-[#111827] border-[#374151] hover:border-[#6b7280]',
    bullet: 'bg-[#9ca3af]'
  }
};

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    const data = await getUserProjects();
    setProjects(data);
    setIsLoading(false);
  };

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    // Optimistic UI update
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    try {
      await updateProjectStatus(projectId, newStatus);
    } catch (err) {
      console.error("Failed to update status, reverting change:", err);
      fetchProjects(); // Revert on failure
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-3">
          <FolderKanban className="w-8 h-8" />
          Projects
        </h1>
        <p className="text-[#9ca3af] mt-2">Manage your cognitive faculties and creative endeavors.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ProjectForm onProjectCreated={fetchProjects} />
        </div>

        <div className="md:col-span-2 grid gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-[#00f0ff] w-8 h-8" /></div>
          ) : projects.length === 0 ? (
            <div className="glass-panel p-8 text-center text-[#6b7280]">No active projects.</div>
          ) : (
            projects.map(proj => {
              const borderColors = {
                'Active': 'border-l-[#10b981]',
                'In-Progress': 'border-l-[#f59e0b]',
                'Archived': 'border-l-[#6b7280]'
              };
              const leftBorderColor = borderColors[proj.status] || 'border-l-[#00f0ff]';
              const createdDateString = proj.createdAt?.seconds 
                ? new Date(proj.createdAt.seconds * 1000).toLocaleDateString()
                : 'Recent';

              return (
                <div key={proj.id} className={`glass-panel p-6 border-l-4 ${leftBorderColor} transition-all`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-[#e0e6ed]">{proj.title}</h3>
                      <p className="text-[#9ca3af] text-sm">{proj.description}</p>
                    </div>
                    
                    {/* Status selection badge */}
                    <div className="flex items-center">
                      <select
                        value={proj.status}
                        onChange={(e) => handleStatusChange(proj.id, e.target.value as ProjectStatus)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none bg-[#0a0f14] ${
                          STATUS_CONFIG[proj.status]?.color || STATUS_CONFIG['In-Progress'].color
                        } cursor-pointer transition-all focus:ring-1 focus:ring-[#00f0ff]`}
                      >
                        <option value="In-Progress" className="bg-[#0a0f14] text-[#fbbf24]">⌛ In-Progress</option>
                        <option value="Active" className="bg-[#0a0f14] text-[#4ade80]">🟢 Active</option>
                        <option value="Archived" className="bg-[#0a0f14] text-[#9ca3af]">📁 Archived</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-[#6b7280] mt-4 font-mono font-bold uppercase border-t border-[#ffffff0d] pt-3">
                    <span>Created: {createdDateString}</span>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[proj.status]?.bullet || 'bg-gray-400'}`}></span>
                      {proj.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
