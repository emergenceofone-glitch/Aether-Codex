export interface Chapter {
  slug: string;
  title: string;
  content: string;
}

// In Vite, we can use import.meta.glob to import files dynamically.
// We import them as raw strings using the ?raw query.
const markdownFiles = import.meta.glob('../content/*.md', { query: '?raw', import: 'default', eager: true });

export function getAllChapters(): Chapter[] {
  const chapters: Chapter[] = [];

  for (const path in markdownFiles) {
    const fileContent = markdownFiles[path] as string;
    const filename = path.split('/').pop() || '';
    const slug = filename.replace('.md', '');
    
    // Simple frontmatter parsing
    let content = fileContent;
    let title = slug;
    
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const match = fileContent.match(frontmatterRegex);
    
    if (match) {
      const frontmatter = match[1];
      content = fileContent.replace(frontmatterRegex, '');
      
      const titleMatch = frontmatter.match(/title:\s*"?([^"\n]+)"?/);
      if (titleMatch) {
        title = titleMatch[1];
      }
    } else {
      const h1Match = content.match(/^#\s+(.*)/m);
      if (h1Match) {
        title = h1Match[1];
      }
    }

    chapters.push({ slug, title, content });
  }

  return chapters.sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getChapterBySlug(slug: string): Chapter | null {
  const chapters = getAllChapters();
  return chapters.find(c => c.slug === slug) || null;
}
