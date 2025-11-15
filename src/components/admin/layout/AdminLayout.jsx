import {
  BarChart3,
  Bell,
  Bird,
  Book,
  Database,
  FileText,
  Home,
  Menu as MenuIcon,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Truck,
  User,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Breadcrumb from "../routing/Breadcrumb";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: <BarChart3 size={20} />,
      label: "Tableau de bord",
    },
    {
      path: "/admin/users",
      icon: <Users size={20} />,
      label: "Utilisateurs",
    },
    {
      path: "/admin/products",
      icon: <Package size={20} />,
      label: "Produits",
    },
    {
      path: "/admin/services",
      icon: <Book size={20} />,
      label: "Services",
    },
    {
      path: "/admin/farms",
      icon: <ShoppingCart size={20} />,
      label: "Fermes",
    },
    {
      path: "/admin/orders",
      icon: <FileText size={20} />,
      label: "Commandes",
    },
    {
      path: "/admin/forums",
      icon: <MessageSquare size={20} />,
      label: "Forums",
    },
    {
      path: "/admin/animals",
      icon: <Bird size={20} />,
      label: "Animaux",
    },
    {
      path: "/admin/deliveries",
      icon: <Truck size={20} />,
      label: "Livraisons",
    },
    {
      path: "/admin/reviews",
      icon: <Star size={20} />,
      label: "Avis Clients",
    },
    {
      path: "/admin/quotes",
      icon: <FileText size={20} />,
      label: "Devis",
    },
    {
      path: "/admin/notifications",
      icon: <Bell size={20} />,
      label: "Notifications",
    },
    {
      path: "/admin/reports",
      icon: <BarChart3 size={20} />,
      label: "Rapports",
    },
    {
      path: "/admin/settings",
      icon: <Settings size={20} />,
      label: "Paramètres",
    },
    {
      path: "/admin/documentation",
      icon: <Book size={20} />,
      label: "Documentation",
    },
    {
      path: "/admin/backup",
      icon: <Database size={20} />,
      label: "Sauvegarde",
    },
    {
      path: "/admin/analytics",
      icon: <BarChart3 size={20} />,
      label: "Analyses Avancées",
    },
    {
      path: "/admin/chat",
      icon: <MessageSquare size={20} />,
      label: "Chat Support",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white w-64 min-h-screen transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative z-30`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">GuinéeAvicole Admin</h2>
        </div>

        {/* Navigation */}
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                location.pathname === item.path ? "bg-gray-700 text-white" : ""
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo à gauche */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-green-600 text-white p-1.5 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-gray-900">
                  GuinéeAvicole
                </span>
              </Link>
              <Link
                to="/"
                className="ml-6 hidden sm:flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Home size={20} />
                <span className="ml-2">Retour à l'accueil</span>
              </Link>
            </div>

            {/* Actions à droite */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mon Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>

              {/* Bouton hamburger à droite */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <MenuIcon size={24} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <Breadcrumb />
          </div>
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="text-center text-sm text-gray-600">
            2025 GuinéeAvicole. Tous droits réservés.
          </div>
        </footer>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
