'use client';

import { useState } from 'react';

interface FileExplorerProps {
  files: string[];
  selectedFile: string | null;
  onSelectFile: (filename: string) => void;
}

interface FileStructure {
  [folder: string]: string[];
}

export default function FileExplorer({ files, selectedFile, onSelectFile }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['public models']));

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.io')) return '📄';
    if (filename.endsWith('.json')) return '⚙️';
    if (filename.endsWith('.md')) return '📝';
    return '📄';
  };

  // Organize files into folder structure
  const organizeFiles = (): FileStructure => {
    const structure: FileStructure = {};
    
    files.forEach(file => {
      // Check if file is in a folder path
      if (file.includes('/')) {
        const [folder, ...rest] = file.split('/');
        if (!structure[folder]) {
          structure[folder] = [];
        }
        structure[folder].push(rest.join('/'));
      } else {
        // Default to "public models" folder
        if (!structure['public models']) {
          structure['public models'] = [];
        }
        structure['public models'].push(file);
      }
    });

    return structure;
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folder)) {
        newSet.delete(folder);
      } else {
        newSet.add(folder);
      }
      return newSet;
    });
  };

  const fileStructure = organizeFiles();

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h3>Models</h3>
      </div>
      <div className="file-list">
        {Object.entries(fileStructure).map(([folder, folderFiles]) => (
          <div key={folder} className="folder-container">
            <div 
              className="folder-header"
              onClick={() => toggleFolder(folder)}
            >
              <span className="folder-icon">{expandedFolders.has(folder) ? '📁' : '📂'}</span>
              <span className="folder-name">{folder}</span>
            </div>
            {expandedFolders.has(folder) && (
              <div className="folder-content">
                {folderFiles.map((file) => {
                  const fullPath = `${folder}/${file}`;
                  return (
                    <div
                      key={fullPath}
                      className={`file-item ${selectedFile === file || selectedFile === fullPath ? 'active' : ''}`}
                      onClick={() => onSelectFile(file)}
                    >
                      <span className="file-icon">{getFileIcon(file)}</span>
                      <span className="file-name">{file}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

