import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Search, Trash2, CheckCheck, Link as LinkIcon, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsLive = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]); // {id,title,message,time,type,target,read}
  const [unread, setUnread] = useState(0);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all'); // all | quote | farmContact
  const esRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    try {
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5002/api/v1';
      const es = new EventSource(base.replace(/\/$/, '') + '/events');
      esRef.current = es;
      es.onmessage = (evt) => {
        if (!mounted) return;
        try {
          const payload = JSON.parse(evt.data || '{}');
          if (!payload?.type || payload?.type === 'connected') return;
          const now = new Date();
          let n;
          if (payload.type === 'quote:new') {
            n = {
              id: `quote-${payload.data?.id}-${now.getTime()}`,
              title: 'Nouveau devis',
              message: `Devis #${payload.data?.id || ''} reçu` ,
              time: now.toLocaleTimeString(),
              target: '/admin/quotes',
              type: 'quote',
              read: false,
            };
          } else if (payload.type === 'farmContact:new') {
            n = {
              id: `farm-${payload.data?.ticketId}-${now.getTime()}`,
              title: 'Nouveau message ferme',
              message: `${payload.data?.farmName || ''}`,
              time: now.toLocaleTimeString(),
              target: '/admin/farm-contacts',
              type: 'farmContact',
              read: false,
            };
          }
          if (n) {
            setItems((prev) => [n, ...prev].slice(0, 100));
            setUnread((u) => u + 1);
          }
        } catch {}
      };
    } catch {}
    return () => { mounted = false; if (esRef.current) esRef.current.close(); };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => (
      (type === 'all' || it.type === type) &&
      (!q || (it.title?.toLowerCase().includes(q) || it.message?.toLowerCase().includes(q)))
    ));
  }, [items, query, type]);

  const markAllRead = () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
  };

  const clearAll = () => {
    setItems([]);
    setUnread(0);
  };

  return (
    <div className="space-y-4">
      {/* Header pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications Live</h1>
          <p className="text-sm sm:text-base text-gray-600">Flux en temps réel (SSE) des nouveaux devis et messages fermes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button onClick={markAllRead} className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50"><CheckCheck className="w-4 h-4 mr-1"/> Tout lu</button>
          <button onClick={clearAll} className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50"><Trash2 className="w-4 h-4 mr-1"/> Vider</button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-3 rounded-lg border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center border rounded px-2">
            <Search className="w-4 h-4 text-gray-400 mr-1"/>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Recherche (titre, message)" className="w-full py-1.5 outline-none text-sm"/>
          </div>
          <div className="flex items-center border rounded px-2">
            <Filter className="w-4 h-4 text-gray-400 mr-1"/>
            <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full py-1.5 text-sm outline-none bg-white">
              <option value="all">Tous</option>
              <option value="quote">Devis</option>
              <option value="farmContact">Messages fermes</option>
            </select>
          </div>
          <div className="flex items-center">
            <div className="text-sm text-gray-600">Non lus: <span className="font-semibold text-gray-900">{unread}</span></div>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="divide-y">
          {filtered.length === 0 && (
            <div className="p-4 text-sm text-gray-500">Aucune notification</div>
          )}
          {filtered.map((n) => (
            <div key={n.id} className={`p-3 sm:p-4 flex items-start justify-between ${n.read ? 'bg-white' : 'bg-green-50'}`}>
              <div className="flex items-start gap-3 min-w-0">
                <Bell className={`w-4 h-4 mt-1 ${n.type === 'quote' ? 'text-indigo-600' : 'text-green-600'}`}/>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{n.title}</div>
                  <div className="text-sm text-gray-700 break-words">{n.message}</div>
                  <div className="text-xs text-gray-500 mt-1">{n.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {n.target && (
                  <button onClick={()=>navigate(n.target)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50 flex items-center">
                    <LinkIcon className="w-3.5 h-3.5 mr-1"/> Ouvrir
                  </button>
                )}
                {!n.read && (
                  <button onClick={()=>{ n.read = true; setItems((prev)=>prev.map(x=>x.id===n.id?{...x, read:true}:x)); setUnread((u)=>u>0?u-1:0); }} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Lu</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsLive;
