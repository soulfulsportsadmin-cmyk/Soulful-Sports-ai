import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  HardDrive, 
  Music, 
  CheckCircle2, 
  AlertTriangle,
  FolderOpen,
  LogIn,
  LogOut,
  Clock,
  Download
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DriveFile, listDriveVoiceovers, uploadAudioToDrive, deleteDriveFile, getOrCreateVoiceoverFolder } from '../services/driveService';
import { GeneratedVoiceover } from '../types/tts';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  isSigningIn: boolean;
  currentVoiceover: GeneratedVoiceover | null;
  onNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignIn,
  onSignOut,
  isSigningIn,
  currentVoiceover,
  onNotification
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);

  // Load files when modal opens and user is signed in
  useEffect(() => {
    if (isOpen && user) {
      loadFiles();
    }
  }, [isOpen, user]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const driveFiles = await listDriveVoiceovers();
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Failed to list drive files:', err);
      onNotification(err.message || 'Failed to load files from Google Drive', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadCurrent = async () => {
    if (!currentVoiceover) {
      onNotification('No generated voiceover to upload. Generate one first!', 'error');
      return;
    }

    setIsUploading(true);
    try {
      let blobToUpload: Blob;

      if (currentVoiceover.audioBlob) {
        blobToUpload = currentVoiceover.audioBlob;
      } else if (currentVoiceover.audioUrl) {
        // Fetch audio blob from URL / data URI
        const res = await fetch(currentVoiceover.audioUrl);
        blobToUpload = await res.blob();
      } else {
        throw new Error('No audio data available for upload');
      }

      // Ensure SvaraAI folder exists
      const folderId = await getOrCreateVoiceoverFolder('SvaraAI Voiceovers');
      const safeTitle = (currentVoiceover.title || 'voiceover')
        .replace(/[^a-zA-Z0-9_\u0D00-\u0D7F]/g, '_')
        .slice(0, 30);
      const fileName = `svara_${currentVoiceover.voiceName}_${safeTitle}_${Date.now()}.wav`;

      const uploaded = await uploadAudioToDrive(
        blobToUpload,
        fileName,
        folderId,
        `Script: ${currentVoiceover.text}`
      );

      onNotification(`Uploaded "${uploaded.name}" to Google Drive folder!`, 'success');
      await loadFiles();
    } catch (err: any) {
      console.error('Drive upload error:', err);
      onNotification(err.message || 'Failed to upload audio to Google Drive', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      await deleteDriveFile(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      onNotification(`File "${fileToDelete.name}" deleted from Google Drive.`, 'info');
      setFileToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      onNotification(err.message || 'Failed to delete file from Google Drive', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#0b0e14] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 flex flex-col gap-5 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Google Drive Cloud Storage</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono">
                  Synced
                </span>
              </h3>
              <p className="text-xs text-slate-400">Save and manage your Malayalam voiceover audio recordings directly in your Google Drive</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication State */}
        {!user ? (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/5 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Connect Your Google Drive</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                Sign in with Google to automatically backup, store, and organize all your voiceover `.wav` audio files into a dedicated <strong className="text-cyan-300">"SvaraAI Voiceovers"</strong> Google Drive folder.
              </p>
            </div>

            {/* Official Google Sign-In Styled Button */}
            <button
              onClick={onSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* User Profile Bar & Upload Action */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-cyan-500/40" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-slate-200">{user.displayName || 'Google User'}</div>
                  <div className="text-[11px] text-slate-400">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleUploadCurrent}
                  disabled={isUploading || !currentVoiceover}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Upload currently generated voiceover audio"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading to Drive...' : 'Save Current Audio to Drive'}</span>
                </button>

                <button
                  onClick={onSignOut}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Sign out of Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drive Files List */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Your Drive Voiceover Recordings ({files.length})</span>
                </span>
                <button
                  onClick={loadFiles}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 text-[11px] transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="h-64 overflow-y-auto space-y-2 pr-1 rounded-xl border border-white/5 bg-slate-950/60 p-2">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin text-cyan-400 mr-2" />
                    <span>Loading Google Drive files...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 gap-2">
                    <Music className="w-8 h-8 opacity-30 text-cyan-400" />
                    <span>No audio recordings found in your Drive yet.</span>
                    <span className="text-[11px] text-slate-600">Click "Save Current Audio to Drive" above to upload your first audio!</span>
                  </div>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 rounded-lg bg-slate-900/80 border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 text-xs group transition-all"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                          <Music className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="font-medium text-slate-200 truncate">{file.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                            <span>{file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : 'Audio'}</span>
                            {file.createdTime && (
                              <span>• {new Date(file.createdTime).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-cyan-300 transition-colors"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete from Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Destructive Action Confirmation Dialog (Mandatory for Workspace APIs) */}
        {fileToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-[#0e121a] border border-rose-500/30 rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-2xl animate-bounceIn">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>Delete Google Drive File?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white">"{fileToDelete.name}"</strong> from your Google Drive? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setFileToDelete(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-500">
          <span>Official Google Drive API Integration</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
