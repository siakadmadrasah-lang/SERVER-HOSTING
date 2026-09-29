import React, { useState, useRef, useMemo } from 'react';
import { 
  FolderTree, 
  FileText, 
  Folder, 
  Lock, 
  Save, 
  Check, 
  RotateCw, 
  FileCode, 
  ExternalLink, 
  Copy, 
  Plus, 
  Upload, 
  FolderPlus,
  Trash2,
  Edit3,
  Download,
  Search,
  ArrowLeft,
  FilePlus,
  Eye,
  Sliders,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  FileArchive
} from 'lucide-react';
import { Website, Language } from '../types';

interface FileManagerViewProps {
  websites: Website[];
  currentLang: Language;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: string;
  rawBytes: number;
  permissions: string;
  owner: string;
  modified: string;
  content?: string;
  path: string; // e.g. "public_html" or "public_html/wp-content"
}

export const FileManagerView: React.FC<FileManagerViewProps> = ({
  websites,
  currentLang
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(websites[0]?.id || '');
  const activeSite = websites.find(w => w.id === selectedSiteId) || websites[0];

  // Current directory path breadcrumb
  const [currentPath, setCurrentPath] = useState<string>('public_html');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initial files dictionary by site
  const [siteFiles, setSiteFiles] = useState<Record<string, FileItem[]>>(() => {
    return {
      default_wp: [
        { id: '1', name: 'wp-admin', type: 'folder', size: '—', rawBytes: 0, permissions: '0755', owner: 'www-data:www-data', modified: '2026-09-26 14:00', path: 'public_html' },
        { id: '2', name: 'wp-content', type: 'folder', size: '—', rawBytes: 0, permissions: '0755', owner: 'www-data:www-data', modified: '2026-09-27 01:20', path: 'public_html' },
        { id: '3', name: 'wp-includes', type: 'folder', size: '—', rawBytes: 0, permissions: '0755', owner: 'www-data:www-data', modified: '2026-09-26 14:00', path: 'public_html' },
        { id: '20', name: 'themes', type: 'folder', size: '—', rawBytes: 0, permissions: '0755', owner: 'www-data:www-data', modified: '2026-09-27 02:00', path: 'public_html/wp-content' },
        { id: '21', name: 'plugins', type: 'folder', size: '—', rawBytes: 0, permissions: '0755', owner: 'www-data:www-data', modified: '2026-09-27 02:15', path: 'public_html/wp-content' },
        { id: '22', name: 'uploads', type: 'folder', size: '—', rawBytes: 0, permissions: '0775', owner: 'www-data:www-data', modified: '2026-09-28 08:30', path: 'public_html/wp-content' },
        { 
          id: '4', 
          name: 'wp-config.php', 
          type: 'file', 
          size: '3.4 KB', 
          rawBytes: 3480,
          permissions: '0600', 
          owner: 'www-data:www-data', 
          modified: '2026-09-26 14:02',
          path: 'public_html',
          content: `<?php\n// Cloud PRO Automated Configuration for WordPress\ndefine('DB_NAME', 'db_portal_wp');\ndefine('DB_USER', 'server');\ndefine('DB_PASSWORD', 'masbagus15');\ndefine('DB_HOST', 'localhost');\ndefine('DB_CHARSET', 'utf8mb4');\ndefine('DB_COLLATE', 'utf8mb4_unicode_ci');\n\n// Keys & Salts\ndefine('AUTH_KEY',         'x7!kP9#mZ02@wQ19s-v83nL');\ndefine('SECURE_AUTH_KEY',  'c9*1mA92jL-!0921z-m091K');\n\n$table_prefix = 'wp_';\ndefine('WP_DEBUG', false);\ndefine('WP_CACHE', true);\n\nif ( ! defined( 'ABSPATH' ) ) {\n    define( 'ABSPATH', __DIR__ . '/' );\n}\nrequire_once ABSPATH . 'wp-settings.php';`
        },
        { 
          id: '5', 
          name: '.htaccess', 
          type: 'file', 
          size: '412 B', 
          rawBytes: 412,
          permissions: '0644', 
          owner: 'www-data:www-data', 
          modified: '2026-09-26 14:02', 
          path: 'public_html',
          content: `# BEGIN WordPress\n<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteBase /\nRewriteRule ^index\\.php$ - [L]\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule . /index.php [L]\n</IfModule>\n# END WordPress`
        },
        { 
          id: '6', 
          name: 'index.php', 
          type: 'file', 
          size: '418 B', 
          rawBytes: 418,
          permissions: '0644', 
          owner: 'www-data:www-data', 
          modified: '2026-09-26 14:00',
          path: 'public_html',
          content: `<?php\n/**\n * Front to the WordPress application. This file doesn't do anything, but loads\n * wp-blog-header.php which tells WordPress to load the theme and output it.\n */\ndefine( 'WP_USE_THEMES', true );\nrequire __DIR__ . '/wp-blog-header.php';`
        },
        { 
          id: '7', 
          name: 'robots.txt', 
          type: 'file', 
          size: '124 B', 
          rawBytes: 124,
          permissions: '0644', 
          owner: 'www-data:www-data', 
          modified: '2026-09-26 14:05',
          path: 'public_html',
          content: `User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\nSitemap: https://server.denbagoes.my.id/sitemap.xml`
        }
      ]
    };
  });

  const activeSiteKey = activeSite?.id || 'default_wp';
  const currentFilesList = siteFiles[activeSiteKey] || siteFiles['default_wp'] || [];

  // Filter items in current path
  const filesInPath = useMemo(() => {
    return currentFilesList.filter(f => {
      const matchPath = f.path === currentPath;
      if (!searchQuery.trim()) return matchPath;
      return matchPath && f.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [currentFilesList, currentPath, searchQuery]);

  // Selected file for editing
  const [selectedFileForEdit, setSelectedFileForEdit] = useState<FileItem | null>(null);
  const [fileEditBuffer, setFileEditBuffer] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedWinPath, setCopiedWinPath] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileBoilerplate, setNewFileBoilerplate] = useState<string>('html');

  const [chmodModalItem, setChmodModalItem] = useState<FileItem | null>(null);
  const [newChmodVal, setNewChmodVal] = useState<string>('0644');

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [showWebFileManagerModal, setShowWebFileManagerModal] = useState<boolean>(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Navigate into folder
  const handleOpenFolder = (folderName: string) => {
    setCurrentPath(prev => `${prev}/${folderName}`);
    setSelectedFileForEdit(null);
  };

  // Navigate back one level
  const handleGoBack = () => {
    if (currentPath === 'public_html') return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/') || 'public_html');
    setSelectedFileForEdit(null);
  };

  // Open file for editing
  const handleOpenFile = (file: FileItem) => {
    if (file.type === 'file') {
      setSelectedFileForEdit(file);
      setFileEditBuffer(file.content || `/* Berkas ${file.name} */\n`);
    } else {
      handleOpenFolder(file.name);
    }
  };

  // Save edited file
  const handleSaveFile = () => {
    if (!selectedFileForEdit) return;
    setSiteFiles(prev => {
      const list = prev[activeSiteKey] || prev['default_wp'];
      const updated = list.map(item => {
        if (item.id === selectedFileForEdit.id) {
          return {
            ...item,
            content: fileEditBuffer,
            size: `${(new Blob([fileEditBuffer]).size / 1024).toFixed(1)} KB`,
            rawBytes: new Blob([fileEditBuffer]).size,
            modified: new Date().toISOString().slice(0, 16).replace('T', ' ')
          };
        }
        return item;
      });
      return { ...prev, [activeSiteKey]: updated };
    });

    setSaveSuccess(true);
    showToast(`Berkas '${selectedFileForEdit.name}' berhasil disimpan!`);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Real File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      const isZip = file.name.toLowerCase().endsWith('.zip');
      const isText = file.type.startsWith('text/') || 
                     file.name.match(/\.(php|html|htm|css|js|ts|json|txt|env|xml|md|sql|htaccess|conf)$/i);

      reader.onload = (event) => {
        const textContent = isText ? (event.target?.result as string) : `/* Binary/Archived file: ${file.name} */`;
        const newFileItem: FileItem = {
          id: `upload-${Date.now()}-${index}`,
          name: file.name,
          type: 'file',
          size: file.size > 1024 * 1024 
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
            : `${(file.size / 1024).toFixed(1)} KB`,
          rawBytes: file.size,
          permissions: isZip ? '0644' : '0644',
          owner: 'www-data:www-data',
          modified: new Date().toISOString().slice(0, 16).replace('T', ' '),
          path: currentPath,
          content: textContent
        };

        setSiteFiles(prev => {
          const list = prev[activeSiteKey] || prev['default_wp'] || [];
          return {
            ...prev,
            [activeSiteKey]: [newFileItem, ...list]
          };
        });

        showToast(`Berkas '${file.name}' (${newFileItem.size}) berhasil diunggah ke ${currentPath}!`);
        if (isText) {
          setSelectedFileForEdit(newFileItem);
          setFileEditBuffer(textContent);
        }
      };

      if (isText) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });

    // Reset input
    e.target.value = '';
  };

  // Create new folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const cleanName = newFolderName.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const newFolder: FileItem = {
      id: `folder-${Date.now()}`,
      name: cleanName,
      type: 'folder',
      size: '—',
      rawBytes: 0,
      permissions: '0755',
      owner: 'www-data:www-data',
      modified: new Date().toISOString().slice(0, 16).replace('T', ' '),
      path: currentPath
    };

    setSiteFiles(prev => {
      const list = prev[activeSiteKey] || prev['default_wp'] || [];
      return {
        ...prev,
        [activeSiteKey]: [newFolder, ...list]
      };
    });

    setNewFolderName('');
    setIsNewFolderModalOpen(false);
    showToast(`Folder '${cleanName}' berhasil dibuat di ${currentPath}!`);
  };

  // Create new file
  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const cleanName = newFileName.trim();

    let initialContent = '';
    if (newFileBoilerplate === 'html') {
      initialContent = `<!DOCTYPE html>\n<html lang="id">\n<head>\n  <meta charset="UTF-8">\n  <title>${cleanName}</title>\n</head>\n<body>\n  <h1>Selamat Datang di ${activeSite?.domain || 'Website'}!</h1>\n  <p>Website ini dikelola langsung melalui Cloud PRO.</p>\n</body>\n</html>`;
    } else if (newFileBoilerplate === 'php') {
      initialContent = `<?php\n/**\n * ${cleanName}\n * Script PHP Virtual Host ${activeSite?.domain}\n */\necho "PHP Server Aktif: " . phpversion();\nphpinfo();\n`;
    } else if (newFileBoilerplate === 'env') {
      initialContent = `APP_NAME="AethelApp"\nAPP_ENV=production\nDB_CONNECTION=mysql\nDB_HOST=127.0.0.1\nDB_DATABASE=${activeSite?.linkedDbName || 'db_custom'}\nDB_USERNAME=server\nDB_PASSWORD=masbagus15\n`;
    } else {
      initialContent = `/* ${cleanName} */\n`;
    }

    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: cleanName,
      type: 'file',
      size: `${(new Blob([initialContent]).size / 1024).toFixed(1)} KB`,
      rawBytes: new Blob([initialContent]).size,
      permissions: '0644',
      owner: 'www-data:www-data',
      modified: new Date().toISOString().slice(0, 16).replace('T', ' '),
      path: currentPath,
      content: initialContent
    };

    setSiteFiles(prev => {
      const list = prev[activeSiteKey] || prev['default_wp'] || [];
      return {
        ...prev,
        [activeSiteKey]: [newFile, ...list]
      };
    });

    setNewFileName('');
    setIsNewFileModalOpen(false);
    setSelectedFileForEdit(newFile);
    setFileEditBuffer(initialContent);
    showToast(`Berkas '${cleanName}' berhasil dibuat dan dibuka di editor!`);
  };

  // Delete item
  const handleDeleteItem = (itemId: string, itemName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Yakin ingin menghapus ${itemName}?`)) {
      setSiteFiles(prev => {
        const list = prev[activeSiteKey] || prev['default_wp'] || [];
        return {
          ...prev,
          [activeSiteKey]: list.filter(item => item.id !== itemId)
        };
      });
      if (selectedFileForEdit?.id === itemId) {
        setSelectedFileForEdit(null);
      }
      showToast(`'${itemName}' telah dihapus.`);
    }
  };

  // Download file directly
  const handleDownloadFile = (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const content = file.content || `File content for ${file.name}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Mengunduh berkas '${file.name}'...`);
  };

  // Save Chmod
  const handleSaveChmod = () => {
    if (!chmodModalItem) return;
    setSiteFiles(prev => {
      const list = prev[activeSiteKey] || prev['default_wp'] || [];
      return {
        ...prev,
        [activeSiteKey]: list.map(item => {
          if (item.id === chmodModalItem.id) {
            return { ...item, permissions: newChmodVal };
          }
          return item;
        })
      };
    });
    showToast(`Hak akses '${chmodModalItem.name}' diubah ke ${newChmodVal}`);
    setChmodModalItem(null);
  };

  // Path breadcrumb parts
  const breadcrumbParts = currentPath.split('/');

  return (
    <div className="space-y-5">
      {/* Hidden File Input for Real Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      {/* Header & Site Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Berkas & Kode</span>
            <span aria-hidden="true">/</span>
            <span className="text-indigo-400 font-medium">File Manager Terintegrasi</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-5 h-5 text-indigo-400" />
            <span>Manajer Berkas & Editor Web Server</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Unggah file website, ekstrak .zip, buat folder/file, dan edit konfigurasi langsung dari browser tanpa error 404.
          </p>
        </div>

        {/* Website Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 shrink-0">Virtual Host:</label>
          <select
            value={selectedSiteId}
            onChange={(e) => {
              setSelectedSiteId(e.target.value);
              setSelectedFileForEdit(null);
              setCurrentPath('public_html');
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          >
            {websites.map(site => (
              <option key={site.id} value={site.id}>{site.domain} ({site.appType.toUpperCase()})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Real Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            title="Pilih file dari HP atau PC untuk diunggah"
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Berkas / Zip</span>
          </button>

          {/* New File Button */}
          <button
            onClick={() => setIsNewFileModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FilePlus className="w-4 h-4 text-emerald-400" />
            <span>Berkas Baru</span>
          </button>

          {/* New Folder Button */}
          <button
            onClick={() => setIsNewFolderModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>Folder Baru</span>
          </button>

          {/* Standalone Web File Manager Dialog Button */}
          <button
            onClick={() => setShowWebFileManagerModal(true)}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Info File Manager Eksternal</span>
          </button>
        </div>

        {/* Search & Windows WSL Path */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berkas..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText('\\\\wsl$\\Ubuntu\\var\\www\\html');
              setCopiedWinPath(true);
              showToast('Path Windows Explorer telah disalin!');
              setTimeout(() => setCopiedWinPath(false), 2000);
            }}
            title="Salin path direktori Windows Explorer"
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedWinPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden lg:inline">{copiedWinPath ? 'Disalin' : '\\\\wsl$\\Ubuntu'}</span>
          </button>
        </div>
      </div>

      {/* Path Breadcrumbs & Up Button */}
      <div className="flex items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2 overflow-x-auto text-slate-300">
          {currentPath !== 'public_html' && (
            <button
              onClick={handleGoBack}
              className="p-1 hover:bg-slate-800 text-indigo-400 hover:text-white rounded flex items-center gap-1 transition-colors"
              title="Kembali ke folder sebelumnya"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] font-sans">Kembali</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">/var/www/html/</span>
            {breadcrumbParts.map((part, index) => {
              const partPath = breadcrumbParts.slice(0, index + 1).join('/');
              const isLast = index === breadcrumbParts.length - 1;
              return (
                <React.Fragment key={partPath}>
                  {index > 0 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                  <button
                    onClick={() => setCurrentPath(partPath)}
                    className={`${isLast ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'} hover:underline`}
                  >
                    {part}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 shrink-0 font-sans hidden sm:block">
          Total: <strong className="text-slate-300 font-mono">{filesInPath.length}</strong> item
        </div>
      </div>

      {/* Main Workspace: File List & Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* File Table Column */}
        <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col ${
          selectedFileForEdit ? 'lg:col-span-5' : 'lg:col-span-12'
        }`}>
          <div className="overflow-x-auto touch-scroll flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5">Nama Berkas / Folder</th>
                  <th className="px-3.5 py-2.5 text-right">Ukuran</th>
                  <th className="px-3.5 py-2.5">Hak Akses</th>
                  <th className="px-3.5 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentPath !== 'public_html' && (
                  <tr 
                    onClick={handleGoBack}
                    className="hover:bg-slate-800/50 cursor-pointer text-slate-400"
                  >
                    <td className="px-3.5 py-2.5 flex items-center gap-2 font-mono">
                      <Folder className="w-4 h-4 text-amber-500/70" />
                      <span>.. [Folder Induk]</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono">—</td>
                    <td className="px-3.5 py-2.5 font-mono">0755</td>
                    <td className="px-3.5 py-2.5 text-right font-sans text-indigo-400">Naik</td>
                  </tr>
                )}

                {filesInPath.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Folder ini masih kosong.</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 text-indigo-400 hover:underline text-xs"
                      >
                        Unggah file sekarang &rarr;
                      </button>
                    </td>
                  </tr>
                ) : (
                  filesInPath.map((file) => {
                    const isSelected = selectedFileForEdit?.id === file.id;
                    const isZip = file.name.toLowerCase().endsWith('.zip');

                    return (
                      <tr
                        key={file.id}
                        onClick={() => handleOpenFile(file)}
                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-600/15 border-l-2 border-indigo-500' : ''
                        }`}
                      >
                        <td className="px-3.5 py-2.5 font-medium text-white flex items-center gap-2 font-mono">
                          {file.type === 'folder' ? (
                            <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : isZip ? (
                            <FileArchive className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : (
                            <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[180px] sm:max-w-xs">{file.name}</span>
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono text-slate-400 tabular-nums">
                          {file.size}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setChmodModalItem(file);
                              setNewChmodVal(file.permissions);
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] hover:text-indigo-400 transition-colors"
                            title="Klik untuk ubah permissions (chmod)"
                          >
                            {file.permissions}
                          </button>
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {file.type === 'file' && (
                              <>
                                <button
                                  onClick={(e) => handleDownloadFile(file, e)}
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded"
                                  title="Unduh berkas"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenFile(file);
                                  }}
                                  className="px-2 py-0.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 rounded text-[11px] font-medium"
                                >
                                  Edit
                                </button>
                              </>
                            )}
                            <button
                              onClick={(e) => handleDeleteItem(file.id, file.name, e)}
                              className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integrated Code Editor Column */}
        {selectedFileForEdit ? (
          <div className="lg:col-span-7 bg-slate-900 border border-indigo-500/40 rounded-xl p-4 flex flex-col h-[560px] shadow-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-semibold text-white font-mono text-sm">{selectedFileForEdit.name}</span>
                <span className="text-[11px] text-slate-500 font-mono">({selectedFileForEdit.size})</span>
              </div>

              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs">
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersimpan!</span>
                  </span>
                )}

                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1"
                  title="Lihat Pratinjau Teks/HTML"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pratinjau</span>
                </button>

                <button
                  onClick={handleSaveFile}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>

                <button
                  onClick={() => setSelectedFileForEdit(null)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                  title="Tutup Editor"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Code Editor Body */}
            <div className="flex-1 relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex flex-col">
              <textarea
                value={fileEditBuffer}
                onChange={(e) => setFileEditBuffer(e.target.value)}
                spellCheck={false}
                className="w-full flex-1 p-3 text-xs text-indigo-100 font-mono bg-transparent focus:outline-none leading-relaxed resize-none selection:bg-indigo-600 selection:text-white"
                placeholder="Mulai ketik kode atau konfigurasi di sini..."
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
              <span>Path: {selectedFileForEdit.path}/{selectedFileForEdit.name}</span>
              <span>Baris: {fileEditBuffer.split('\n').length} | Karakter: {fileEditBuffer.length}</span>
            </div>
          </div>
        ) : (
          /* Empty State when no file is selected on desktop */
          <div className="hidden lg:col-span-7 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-8 lg:flex flex-col items-center justify-center text-center text-slate-500">
            <FileCode className="w-12 h-12 mb-3 text-slate-600" />
            <h3 className="font-semibold text-slate-300 text-sm">Editor Kode Langsung</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Pilih salah satu berkas dari tabel sebelah kiri (misal: <code className="text-indigo-400">wp-config.php</code> atau <code className="text-indigo-400">.htaccess</code>) untuk membaca atau mengedit isinya secara langsung.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setIsNewFileModalOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1.5"
              >
                <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buat Berkas Baru</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Card: Cara Akses Berkas di PC & Windows */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>Panduan Lengkap Mengelola Berkas Web Server:</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-1">
            <strong className="text-indigo-300 block">1. Lewat Panel Web Ini (Rekomendasi)</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Langsung klik tombol <strong>&quot;Unggah Berkas / Zip&quot;</strong> di atas untuk upload source code dari HP atau PC Anda. Klik <strong>Edit</strong> untuk mengubah isi file langsung di browser.
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-1">
            <strong className="text-indigo-300 block">2. Lewat Windows File Explorer (WSL)</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Tekan <kbd className="px-1 bg-slate-800 rounded text-slate-300 font-mono">Win + R</kbd> di PC Windows Anda, lalu ketik:
              <code className="block mt-1 p-1 bg-slate-900 rounded font-mono text-indigo-300 text-[10px]">\\wsl$\Ubuntu\var\www\html</code>
              Anda bisa copy-paste file website langsung seperti folder Windows biasa!
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-1">
            <strong className="text-indigo-300 block">3. Web File Manager PHP Standalone</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              File Manager berbasis PHP telah disertakan di folder <code className="text-indigo-300">/filemanager/index.php</code>. Username: <code className="text-indigo-300 font-bold">server</code>, Password: <code className="text-indigo-300 font-bold">masbagus15</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: New Folder */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-amber-400" />
                <span>Buat Folder Baru</span>
              </h3>
              <button onClick={() => setIsNewFolderModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nama Folder:</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="contoh: uploads atau css"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                autoFocus
              />
              <p className="text-[10px] text-slate-500 mt-1">Akan dibuat di direktori: /{currentPath}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewFolderModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs"
              >
                Buat Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New File */}
      {isNewFileModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-emerald-400" />
                <span>Buat Berkas Baru</span>
              </h3>
              <button onClick={() => setIsNewFileModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nama Berkas:</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="contoh: index.html atau .env"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Pilih Templat Awal:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'html', label: 'HTML5' },
                    { id: 'php', label: 'PHP Script' },
                    { id: 'env', label: '.ENV Config' },
                    { id: 'blank', label: 'Kosong' }
                  ].map(tmpl => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setNewFileBoilerplate(tmpl.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-colors ${
                        newFileBoilerplate === tmpl.id 
                          ? 'bg-indigo-600 text-white font-semibold' 
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewFileModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleCreateFile}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs"
              >
                Buat & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Chmod Permissions */}
      {chmodModalItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Ubah Hak Akses (chmod)</span>
              </h3>
              <button onClick={() => setChmodModalItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-mono">Berkas: <strong>{chmodModalItem.name}</strong></p>
              
              <div className="grid grid-cols-3 gap-2">
                {['0644', '0755', '0775', '0777', '0600'].map(code => (
                  <button
                    key={code}
                    onClick={() => setNewChmodVal(code)}
                    className={`p-2 rounded-lg text-xs font-mono text-center transition-colors ${
                      newChmodVal === code 
                        ? 'bg-indigo-600 text-white font-bold' 
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setChmodModalItem(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSaveChmod}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Preview File */}
      {isPreviewOpen && selectedFileForEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Pratinjau: {selectedFileForEdit.name}</span>
              </h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-indigo-100 whitespace-pre-wrap">
              {fileEditBuffer}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Web File Manager Standalone Info */}
      {showWebFileManagerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-indigo-400" />
                <span>Web File Manager Standalone (PHP)</span>
              </h3>
              <button onClick={() => setShowWebFileManagerModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Cloud PRO menyertakan skrip Web File Manager berbasis PHP yang berjalan langsung di server Nginx &amp; PHP 8.3-FPM Anda.
              </p>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">URL Akses:</span>
                  <span className="text-indigo-400 font-bold">/filemanager/index.php</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Username:</span>
                  <span className="text-emerald-400 font-bold">server</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Password:</span>
                  <span className="text-emerald-400 font-bold">masbagus15</span>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-lg text-[11px]">
                <strong>Tips Anti-404:</strong> Gunakan File Manager terintegrasi di halaman panel ini (tombol &quot;Unggah Berkas / Zip&quot; di atas) untuk kemudahan maksimal tanpa perlu berpindah jendela tab.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWebFileManagerModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.open('/filemanager/index.php', '_blank');
                  setShowWebFileManagerModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
              >
                <span>Buka /filemanager/index.php</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 border border-indigo-500/50 rounded-xl shadow-2xl text-xs text-white animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
