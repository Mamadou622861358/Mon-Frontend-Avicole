import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Package, 
  Home, 
  ShoppingCart, 
  MessageSquare, 
  Bird, 
  Truck, 
  Star, 
  Bell, 
  FileText, 
  Settings, 
  Book, 
  Database, 
  TrendingUp, 
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminService } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';

const iconMap = {
  BarChart3,
  Users,
  Package,
  Home,
  ShoppingCart,
  MessageSquare,
  Bird,
  Truck,
  Star,
  Bell,
  FileText,
  Settings,
  Book,
  Database,
  TrendingUp,
  MessageCircle
};

const AdminSidebar = ({ collapsed, onToggle, modules, currentModule }) => {
  const location = useLocation();
  const [newFarmContacts, setNewFarmContacts] = useState(0);
  const [newQuotes, setNewQuotes] = useState(0);
  const { showSuccess } = useToast();

  useEffect(() => {
    let mounted = true;
    const fetchCounts = async () => {
      try {
        // Farm contacts
        try {
          const resFC = await adminService.getFarmContacts();
          const items = Array.isArray(resFC.data?.data) ? resFC.data.data : [];
          const countFC = items.filter(i => i.status === 'new').length;
          if (mounted) setNewFarmContacts(countFC);
        } catch {}
        // Quotes (use server-side filtered meta.total)
        try {
          const resQ = await adminService.getQuotes({ status: 'new', page: 1, limit: 1 });
          const total = resQ.data?.meta?.total ?? 0;
          if (mounted) setNewQuotes(total);
        } catch {}
      } catch {}
    };
    fetchCounts();
    const id = setInterval(fetchCounts, 30000);
    // SSE subscription
    let es;
    try {
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5002/api/v1';
      es = new EventSource(base.replace(/\/$/, '') + '/events');
      es.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data || '{}');
          if (!mounted) return;
          if (payload?.type === 'quote:new') {
            setNewQuotes((prev) => prev + 1);
            try { showSuccess('Nouveau devis', `#${payload?.data?.id || ''} reçu`); } catch {}
          } else if (payload?.type === 'farmContact:new') {
            setNewFarmContacts((prev) => prev + 1);
            try { showSuccess('Nouveau message ferme', `${payload?.data?.farmName || ''}`); } catch {}
          }
        } catch {}
      };
      es.onerror = () => {
        // Fail silently; interval fallback keeps counts fresh
      };
    } catch {}
    return () => { mounted = false; clearInterval(id); if (es) es.close(); };
  }, []);

  return (
    <>
      {/* Overlay pour mobile */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      } ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700">
          {!collapsed && (
            <div className="flex items-center min-w-0">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">GA</span>
              </div>
              <span className="font-semibold text-base sm:text-lg truncate">GuinéeAvicole</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-3 sm:mt-4 px-2 flex-1 overflow-y-auto pb-20">
          {modules.map(([key, module]) => {
            const IconComponent = iconMap[module.icon] || BarChart3;
            const isActive = location.pathname.includes(`/admin/${key}`);
            
            return (
              <Link
                key={key}
                to={`/admin/${key}`}
                className={`flex items-center px-2 sm:px-3 py-2.5 sm:py-3 mb-1 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                title={collapsed ? module.title : ''}
                onClick={() => {
                  // Fermer la sidebar sur mobile après clic
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              >
                <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${collapsed ? 'mx-auto' : 'mr-2 sm:mr-3'} flex-shrink-0`} />
                {!collapsed && (
                  <span className="font-medium text-xs sm:text-sm truncate">{module.title}</span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  {key === 'farm-contacts' && newFarmContacts > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-600 text-white flex-shrink-0">{newFarmContacts}</span>
                  )}
                  {key === 'quotes' && newQuotes > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-600 text-white flex-shrink-0">{newQuotes}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
            <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
              <div className="text-xs text-gray-400 mb-1">Administration</div>
              <div className="text-xs sm:text-sm font-medium">Panel v2.0</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;
