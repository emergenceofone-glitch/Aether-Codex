import { useState, useEffect } from 'react';
import { getUserProjects, Project } from '../lib/projectService';
import ProjectForm from '../components/ProjectForm';
import { FolderKanban, Loader2 } from 'lucide-react';

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    const data = await getUserProjects();
    setProjects(data);
    setIsLoading(false);
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
            projects.map(proj => (
              <div key={proj.id} className="glass-panel p-6 border-l-4 border-l-[#00f0ff]">
                <h3 className="text-lg font-bold text-[#e0e6ed]">{proj.title}</h3>
                <p className="text-[#9ca3af] text-sm mt-1">{proj.description}</p>
                <div className="text-[10px] text-[#6b7280] mt-4 font-mono font-bold uppercase">
                  Created: {new Date(proj.createdAt?.seconds * 1000).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
