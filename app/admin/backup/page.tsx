'use client';

import { useState } from 'react';

const SECTIONS = [
  { id: 'articles', label: 'Articles', icon: '📝', desc: 'All published and draft articles' },
  { id: 'categories', label: 'Categories', icon: '📂', desc: 'Category tree and metadata' },
  { id: 'users', label: 'Users', icon: '👥', desc: 'User accounts and roles' },
  { id: 'tags', label: 'Tags', icon: '🏷️', desc: 'Tag definitions and relationships' },
  { id: 'authorRequests', label: 'Author Requests', icon: '📨', desc: 'Pending and resolved author requests' },
  { id: 'comments', label: 'Comments', icon: '💬', desc: 'Article comments' },
  { id: 'siteSettings', label: 'Site Settings', icon: '⚙️', desc: 'Global site configuration' },
  { id: 'userSettings', label: 'User Settings', icon: '🔧', desc: 'Individual user preferences' },
] as const;

export default function AdminBackupPage() {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set(SECTIONS.map(s => s.id)));
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const toggleSection = (id: string) => {
    setSelectedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedSections(new Set(SECTIONS.map(s => s.id)));
  };

  const deselectAll = () => {
    setSelectedSections(new Set());
  };

  const handleBackup = async (format?: 'mongodump' | 'json') => {
    if (selectedSections.size === 0) {
      setStatus({ type: 'error', message: 'Select at least one section to back up.' });
      return;
    }

    setIsBackingUp(true);
    setStatus(null);

    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: [...selectedSections], format }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Backup failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const disposition = res.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="?(.+?)"?$/);
      a.download = filenameMatch?.[1] || `tech-hub-backup-${new Date().toISOString().split('T')[0]}.json`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus({ type: 'success', message: 'Backup downloaded successfully.' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Backup failed' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!window.confirm('This will REPLACE all existing data in the selected collections with the backup data. Are you sure?')) {
        return;
      }

      setIsRestoring(true);
      setStatus(null);

      try {
        const text = await file.text();
        const backup = JSON.parse(text);
        const collections = backup.collections;

        if (!collections || typeof collections !== 'object') {
          throw new Error('Invalid backup file: missing "collections" field');
        }

        const res = await fetch('/api/admin/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collections }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Restore failed');
        }

        const data = await res.json();
        setStatus({ type: 'success', message: `Restored ${data.totalCollections} collections.` });
      } catch (err: any) {
        setStatus({ type: 'error', message: err.message || 'Restore failed' });
      } finally {
        setIsRestoring(false);
      }
    };
    input.click();
  };

  const isFullBackup = selectedSections.size === SECTIONS.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backup Database</h1>
          <p className="text-gray-600 mt-2">
            Export or restore database collections. Only available to superusers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {isFullBackup ? 'Full backup selected' : `${selectedSections.size} of ${SECTIONS.length} sections selected`}
          </span>
        </div>
      </div>

      {status && (
        <div className={`rounded-lg px-4 py-3 ${
          status.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {status.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Sections to Back Up</h2>
          <div className="flex items-center gap-2">
            <button onClick={selectAll} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={deselectAll} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SECTIONS.map((section) => (
            <label
              key={section.id}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedSections.has(section.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSections.has(section.id)}
                onChange={() => toggleSection(section.id)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium text-gray-900">{section.label}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{section.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {isFullBackup ? (
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleBackup('mongodump')}
            disabled={isBackingUp}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isBackingUp ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Backing up...</>
            ) : (
              <><span>🗃️</span>Download Full Backup (mongodump)</>
            )}
          </button>
          <button
            onClick={() => handleBackup('json')}
            disabled={isBackingUp}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isBackingUp ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Backing up...</>
            ) : (
              <><span>💾</span>Download Full Backup (JSON)</>
            )}
          </button>
          <button
            onClick={handleRestore}
            disabled={isRestoring}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isRestoring ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Restoring...</>
            ) : (
              <><span>📥</span>Restore from JSON Backup</>
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {selectedSections.size > 0 && (
            <button
              onClick={() => handleBackup('json')}
              disabled={isBackingUp}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {isBackingUp ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Backing up...</>
              ) : (
                <><span>💾</span>Download Backup (JSON)</>
              )}
            </button>
          )}
          <button
            onClick={handleRestore}
            disabled={isRestoring}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isRestoring ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Restoring...</>
            ) : (
              <><span>📥</span>Restore from JSON Backup</>
            )}
          </button>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-2">⚠️ Important Notes</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
          <li><strong>JSON backups</strong> (full or partial) can be restored directly from this page via the &quot;Restore from JSON Backup&quot; button.</li>
          <li><strong>mongodump backups</strong> cannot be restored from the web interface because the backup is stored in a proprietary BSON format that requires the <code className="bg-amber-100 px-1 rounded">mongorestore</code> CLI tool installed on the server to process. The browser cannot read or parse BSON files to reconstruct database documents.</li>
          <li>To restore a mongodump backup via CLI: <code className="bg-amber-100 px-1 rounded">tar -xzf backup.tar.gz && mongorestore --uri="mongodb://localhost:27017" --db=tech_hub_cms dump/</code></li>
        </ul>
      </div>
    </div>
  );
}
