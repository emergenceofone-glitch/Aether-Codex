import { useState, useEffect, useCallback } from 'react';
import { getAccessToken, loginWithGoogle } from '../firebase';
import { 
  listDriveFiles, 
  fetchDriveFileContent, 
  createDriveTextFile, 
  deleteDriveFile, 
  DriveFile 
} from '../lib/driveService';
import { getAllChapters } from '../lib/codex';
import { 
  HardDrive, 
  Search, 
  Plus, 
  Trash2, 
  FileText, 
  Folder, 
  RefreshCw, 
  ExternalLink, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  FileSpreadsheet, 
  BookOpen,
  X,
  FileCode
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DriveView() {
  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken());
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Selected file preview
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState<boolean>(false);

  // Confirmation Modal for Destructive Delete Operation
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Export Codex Chapter Modal
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [selectedChapterSlug, setSelectedChapterSlug] = useState<string>('00_Genesis_Block');
  const [exportFileName, setExportFileName] = useState<string>('00_Genesis_Block.md');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const chapters = getAllChapters();

  const handleFetchFiles = useCallback(async () => {
    const token = getAccessToken() || accessToken;
    if (!token) {
      setFiles([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await listDriveFiles(token, searchQuery, filterType);
      setFiles(result);
    } catch (err: any) {
      console.error('Error fetching drive files:', err);
      setError(err.message || 'Failed to fetch files from Google Drive');
    } finally {
      setLoading(false);
    }
  }, [accessToken, searchQuery, filterType]);

  useEffect(() => {
    if (accessToken) {
      handleFetchFiles();
    }
  }, [accessToken, handleFetchFiles]);

  const handleConnectDrive = async () => {
    try {
      setError(null);
      await loginWithGoogle();
      const token = getAccessToken();
      setAccessToken(token);
      if (token) {
        handleFetchFiles();
      }
    } catch (err: any) {
      setError(err.message || 'Drive connection failed');
    }
  };

  const handleSelectFile = async (file: DriveFile) => {
    setSelectedFile(file);
    setFileContent(null);
    const token = getAccessToken() || accessToken;

    if (!token) return;

    if (
      file.mimeType.startsWith('text/') || 
      file.mimeType === 'application/json' || 
      file.mimeType === 'application/vnd.google-apps.document'
    ) {
      setLoadingContent(true);
      try {
        const content = await fetchDriveFileContent(token, file.id, file.mimeType);
        setFileContent(content);
      } catch (err: any) {
        setFileContent(`[Unable to preview file content: ${err.message}]`);
      } finally {
        setLoadingContent(false);
      }
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    const token = getAccessToken() || accessToken;
    if (!token) return;

    setIsDeleting(true);
    try {
      await deleteDriveFile(token, fileToDelete.id);
      setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      if (selectedFile?.id === fileToDelete.id) {
        setSelectedFile(null);
        setFileContent(null);
      }
      setFileToDelete(null);
    } catch (err: any) {
      setError(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken() || accessToken;
    if (!token) {
      setError('Please authenticate with Google Drive first');
      return;
    }

    const chapter = chapters.find(c => c.slug === selectedChapterSlug);
    if (!chapter) return;

    setIsExporting(true);
    setExportSuccess(null);
    try {
      const created = await createDriveTextFile(
        token, 
        exportFileName.endsWith('.md') ? exportFileName : `${exportFileName}.md`, 
        `# ${chapter.title}\n\n${chapter.content}`, 
        'text/markdown'
      );
      setExportSuccess(`Successfully exported "${created.name}" to Google Drive!`);
      setTimeout(() => {
        setShowExportModal(false);
        setExportSuccess(null);
        handleFetchFiles();
      }, 1500);
    } catch (err: any) {
      setError(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <Folder className="w-5 h-5 text-amber-400" />;
    if (mimeType.includes('spreadsheet')) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (mimeType.includes('document') || mimeType.includes('text')) return <FileText className="w-5 h-5 text-[#00f0ff]" />;
    return <FileCode className="w-5 h-5 text-purple-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 glass-panel p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#00f0ff1a] border border-[#00f0ff4d] rounded-xl text-[#00f0ff]">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#e0e6ed] tracking-wider uppercase flex items-center gap-2">
              Google Drive Vault <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f0ff22] text-[#00f0ff] border border-[#00f0ff44]">OAuth 2.0</span>
            </h1>
            <p className="text-xs text-[#9ca3af]">Cloud Sync and Repository for Aetherium Codex Telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://notebooklm.google.com/notebook/dd603037-a662-411c-8173-570f33b72306?utm_source=nlmm_share"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-rose-500/40 bg-rose-950/30 text-rose-300 font-semibold text-xs px-3.5 py-2 rounded-lg hover:bg-rose-900/40 transition-all"
            title="Open NotebookLM Research Vault"
          >
            <BookOpen className="w-4 h-4 text-rose-400" /> NotebookLM Vault <ExternalLink className="w-3 h-3" />
          </a>

          {accessToken ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" /> Drive Connected
              </span>
              <button
                onClick={handleFetchFiles}
                disabled={loading}
                className="p-2 border border-[#ffffff1a] rounded-lg hover:border-[#00f0ff] text-[#e0e6ed] hover:text-[#00f0ff] transition-all"
                title="Refresh Drive Files"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 bg-[#00f0ff] text-black font-semibold text-xs px-4 py-2 rounded-lg hover:bg-[#00c0cc] transition-all"
              >
                <Plus className="w-4 h-4" /> Export Codex to Drive
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectDrive}
              className="flex items-center gap-2 bg-[#00f0ff] text-black font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#00c0cc] transition-all"
            >
              <HardDrive className="w-4 h-4" /> Connect Google Drive
            </button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!accessToken ? (
        <div className="glass-panel p-12 text-center max-w-lg mx-auto my-12">
          <HardDrive className="w-16 h-16 text-[#00f0ff] mx-auto mb-4 opacity-70 animate-pulse" />
          <h2 className="text-xl font-bold text-[#e0e6ed] mb-2">Google Drive Not Connected</h2>
          <p className="text-sm text-[#9ca3af] mb-6 leading-relaxed">
            Authorize your Google account to read, search, upload, and export Codex documents directly to your Google Drive repository.
          </p>
          <button
            onClick={handleConnectDrive}
            className="w-full bg-[#00f0ff] text-black font-bold py-3 rounded-xl hover:bg-[#00c0cc] transition-all text-sm tracking-wide shadow-lg shadow-[#00f0ff22]"
          >
            Authenticate & Access Google Drive
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Explorer Pane */}
          <div className="lg:col-span-7 glass-panel p-6 flex flex-col">
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Search Google Drive files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#00000040] border border-[#ffffff1a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="flex gap-2 text-xs overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Files' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'spreadsheets', label: 'Spreadsheets' },
                  { id: 'folders', label: 'Folders' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id)}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      filterType === t.id 
                        ? 'bg-[#00f0ff22] border-[#00f0ff] text-[#00f0ff]' 
                        : 'border-[#ffffff1a] text-[#9ca3af] hover:text-[#e0e6ed]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px] pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-[#00f0ff] gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-xs uppercase font-mono">Querying Drive Index...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12 text-[#6b7280] text-sm">
                  No files found matching your criteria in Google Drive.
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedFile?.id === file.id
                        ? 'bg-[#00f0ff15] border-[#00f0ff]'
                        : 'bg-[#00000020] border-[#ffffff10] hover:border-[#ffffff30]'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {getFileIcon(file.mimeType)}
                      <div className="truncate">
                        <h4 className="text-sm font-medium text-[#e0e6ed] truncate">{file.name}</h4>
                        <p className="text-[10px] text-[#9ca3af] font-mono">
                          {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Drive File'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-[#9ca3af] hover:text-[#00f0ff] transition-colors"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileToDelete(file);
                        }}
                        className="p-1.5 text-[#9ca3af] hover:text-red-400 transition-colors"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* File Preview Pane */}
          <div className="lg:col-span-5 glass-panel p-6 flex flex-col min-h-[400px]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9ca3af] mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00f0ff]" /> File Inspector
            </h3>

            {selectedFile ? (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="p-4 bg-[#00000040] border border-[#ffffff1a] rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <h2 className="text-base font-bold text-[#e0e6ed]">{selectedFile.name}</h2>
                    {selectedFile.webViewLink && (
                      <a
                        href={selectedFile.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#00f0ff] hover:underline flex items-center gap-1"
                      >
                        Drive <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="text-[11px] text-[#9ca3af] space-y-1 font-mono">
                    <div>Type: {selectedFile.mimeType}</div>
                    {selectedFile.modifiedTime && (
                      <div>Modified: {new Date(selectedFile.modifiedTime).toLocaleString()}</div>
                    )}
                  </div>
                </div>

                <div className="flex-1 bg-[#00000030] border border-[#ffffff10] rounded-xl p-4 overflow-y-auto max-h-[350px]">
                  {loadingContent ? (
                    <div className="flex items-center justify-center h-full text-[#00f0ff] gap-2 py-8">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-xs font-mono">Reading Content Stream...</span>
                    </div>
                  ) : fileContent ? (
                    <div className="markdown-body text-xs text-[#e0e6ed]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {fileContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-xs text-[#6b7280] italic text-center py-8">
                      Select a text document or markdown file to preview content.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#6b7280]">
                <FileText className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">No file selected</p>
                <p className="text-xs mt-1">Select any document from the list to inspect metadata and content.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION DIALOG FOR FILE DELETION */}
      {fileToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel max-w-md w-full p-6 border-red-500/40 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#e0e6ed]">Confirm File Deletion</h3>
                <p className="text-xs text-red-300 mt-1">
                  This destructive operation will permanently remove the file from your Google Drive.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#00000040] border border-[#ffffff1a] rounded-lg">
              <p className="text-xs font-mono text-[#e0e6ed] font-semibold">{fileToDelete.name}</p>
              <p className="text-[10px] font-mono text-[#9ca3af] mt-0.5">ID: {fileToDelete.id}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-[#ffffff1a] text-xs font-medium text-[#e0e6ed] hover:bg-[#ffffff10]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Codex Chapter to Drive Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#ffffff1a] pb-4">
              <h3 className="text-lg font-bold text-[#e0e6ed] flex items-center gap-2">
                <Download className="w-5 h-5 text-[#00f0ff]" /> Export Codex Chapter to Drive
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-[#9ca3af] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {exportSuccess ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {exportSuccess}
              </div>
            ) : (
              <form onSubmit={handleExportChapter} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                    Select Codex Chapter
                  </label>
                  <select
                    value={selectedChapterSlug}
                    onChange={(e) => {
                      setSelectedChapterSlug(e.target.value);
                      setExportFileName(`${e.target.value}.md`);
                    }}
                    className="w-full bg-[#00000060] border border-[#ffffff1a] rounded-xl px-3 py-2 text-sm text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff]"
                  >
                    {chapters.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title} ({c.slug}.md)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                    Drive Target File Name
                  </label>
                  <input
                    type="text"
                    value={exportFileName}
                    onChange={(e) => setExportFileName(e.target.value)}
                    required
                    className="w-full bg-[#00000060] border border-[#ffffff1a] rounded-xl px-3 py-2 text-sm text-[#e0e6ed] focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ffffff1a]">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 rounded-lg border border-[#ffffff1a] text-xs font-medium text-[#e0e6ed] hover:bg-[#ffffff10]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-[#00f0ff] text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#00c0cc] transition-all"
                  >
                    {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
                    Export to Drive
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
