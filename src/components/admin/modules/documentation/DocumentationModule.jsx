import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Download,
  ExternalLink,
  FileText,
  Video,
  Code,
  Upload,
  Trash
} from 'lucide-react';

import { adminService } from "../../../../../services/api";

const DocumentationModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [docType, setDocType] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });

  const fetchDocs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { q: searchTerm || undefined, type: docType, page, limit };
      const resp = await adminService.getDocs(params);
      const items = resp?.data?.data || resp?.data || [];
      const m = resp?.data?.meta || {};
      setDocs(Array.isArray(items) ? items : []);
      setMeta({
        total: Number(m.total) || items.length,
        page: Number(m.page) || page,
        limit: Number(m.limit) || limit,
        totalPages: Number(m.totalPages) || 1
      });
    } catch (e) {
      setError("Impossible de charger la documentation.");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [docType, page, limit]);

  const filtered = docs; // filtrage serveur (q, type)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Documentation</h1>
          <p className="text-sm sm:text-base text-gray-600">Guides et ressources pour l'administration</p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".md,.pdf,.docx,.txt"
            ref={fileInputRef}
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                setLoading(true);
                const toBase64 = (file) => new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                });
                const dataUrl = await toBase64(f);
                await adminService.createDoc(f.name, String(dataUrl));
                await fetchDocs();
              } catch (err) {
                setError("Échec de l'upload du document.");
              } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Uploader</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchDocs(); } }}
              className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <select
              value={docType}
              onChange={(e) => { setDocType(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">Tous les types</option>
              <option value="pdf">PDF</option>
              <option value="md">Markdown</option>
              <option value="docx">Word</option>
              <option value="txt">Texte</option>
            </select>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value={6}>6 / page</option>
              <option value={9}>9 / page</option>
              <option value={12}>12 / page</option>
            </select>
            <div className="text-sm text-gray-600">{meta.total} fichiers</div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-sm text-gray-600">
          Chargement de la documentation...
        </div>
      )}
      {error && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-sm text-gray-600">
          Aucune documentation disponible pour le moment. Cette section sera activée lorsque l'API d'export/liste de documents sera implémentée.
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filtered.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{doc.name}</h3>
                  <p className="text-xs text-gray-500">{doc.type?.toUpperCase()} • {Math.ceil((Number(doc.size)||0)/1024)} Ko</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const resp = await adminService.getDocFile(doc.id);
                      const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'application/octet-stream' });
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank');
                      setTimeout(() => URL.revokeObjectURL(url), 60_000);
                    } catch (e) {
                      setError("Impossible d'ouvrir le document (auth requise).");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <span className="text-sm">Ouvrir</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const resp = await adminService.getDocFile(doc.id);
                      const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'application/octet-stream' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = doc.name || 'document';
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      setTimeout(() => URL.revokeObjectURL(url), 60_000);
                    } catch (e) {
                      setError('Impossible de télécharger le document (auth requise).');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="flex items-center justify-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="text-sm">Télécharger</span>
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm(`Supprimer le document "${doc.name}" ?`)) return;
                    try {
                      setLoading(true);
                      await adminService.deleteDoc(doc.id);
                      await fetchDocs();
                    } catch (err) {
                      setError('Impossible de supprimer le document.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Supprimer"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && meta.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className={`px-3 py-2 text-sm rounded-md border ${page <= 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            Précédent
          </button>
          <span className="text-sm text-gray-700">Page {meta.page} / {meta.totalPages}</span>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
            className={`px-3 py-2 text-sm rounded-md border ${page >= meta.totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentationModule;
