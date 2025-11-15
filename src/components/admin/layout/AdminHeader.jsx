import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Home,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const AdminHeader = ({ user, currentModule, onSidebarToggle }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Notifications temps réel (SSE)
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [sources, setSources] = useState(null); // {quotes, farmContacts}

  useEffect(() => {
    let mounted = true;
    let es;
    try {
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5002/api/v1';
      // Fetch sources once
      fetch(base.replace(/\/$/, '') + '/admin/integrity/summary')
        .then(r => r.json())
        .then(d => { if (mounted) setSources(d?.sources || null); })
        .catch(()=>{});
      es = new EventSource(base.replace(/\/$/, '') + '/events');
      es.onmessage = (evt) => {
        if (!mounted) return;
        try {
          const payload = JSON.parse(evt.data || '{}');
          if (!payload?.type || payload?.type === 'connected') return;
          const now = new Date();
          let item;
          if (payload.type === 'quote:new') {
            item = {
              id: `quote-${payload.data?.id}-${now.getTime()}`,
              title: 'Nouveau devis',
              message: `Devis #${payload.data?.id || ''} reçu` ,
              time: 'à l\'instant',
              target: '/admin/quotes',
              type: 'quote'
            };
          } else if (payload.type === 'farmContact:new') {
            item = {
              id: `farm-${payload.data?.ticketId}-${now.getTime()}`,
              title: 'Nouveau message ferme',
              message: `${payload.data?.farmName || ''}`,
              time: 'à l\'instant',
              target: '/admin/farm-contacts',
              type: 'farmContact'
            };
          }
          if (item) {
            setNotifications((prev) => [item, ...prev].slice(0, 20));
            setUnread((u) => u + 1);
          }
        } catch {}
      };
    } catch {}
    return () => { mounted = false; if (es) es.close(); };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Gauche - Menu burger et titre */}
        <div className="flex items-center min-w-0 flex-1">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 mr-2 sm:mr-4 flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {currentModule?.title || 'Administration'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
              Gérez votre plateforme GuinéeAvicole
            </p>
          </div>
        </div>

        {/* Centre - Barre de recherche */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Droite - Actions et profil */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
          {/* Lien retour accueil */}
          <Link
            to="/"
            className="hidden md:flex items-center px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4 sm:mr-2" />
            <span className="text-sm hidden lg:inline">Accueil</span>
          </Link>

          {/* Aide */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>

            {/* Menu notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-w-[calc(100vw-2rem)] mr-2 sm:mr-0">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setNotifications([]); setUnread(0); }} className="text-xs text-gray-500 hover:text-gray-700">Vider</button>
                      <button onClick={() => setUnread(0)} className="text-xs text-green-600 hover:text-green-700">Tout lu</button>
                    </div>
                  </div>
                  {sources && (
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                      <span className={`px-1.5 py-0.5 rounded-full border ${sources.quotes === 'mongo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>Devis: {sources.quotes === 'mongo' ? 'MongoDB' : 'JSON'}</span>
                      <span className={`px-1.5 py-0.5 rounded-full border ${sources.farmContacts === 'mongo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>Inbox Fermes: {sources.farmContacts === 'mongo' ? 'MongoDB' : 'JSON'}</span>
                    </div>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="p-3 text-sm text-gray-500">Aucune notification</div>
                  )}
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setShowNotifications(false);
                        setUnread((u) => (u > 0 ? u - 1 : 0));
                        if (n.target) navigate(n.target);
                      }}
                      className="w-full text-left p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                          <p className="text-sm text-gray-600 mt-1 break-words">{n.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{n.time}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 sm:p-4">
                  <button className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Administrateur'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Menu déroulant utilisateur */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-w-[calc(100vw-2rem)] mr-2 sm:mr-0">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@guineeavicole.com'}</p>
                </div>
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Mon Profil
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Paramètres
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fermer les menus en cliquant ailleurs */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default AdminHeader;
