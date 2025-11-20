/**
 * Composant Layout - Wrapper principal de l'application
 */

import {
  Briefcase,
  ChevronDown,
  Home,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Package,
  Plus,
  Settings,
  ShoppingCart,
  Star,
  Store,
  User,
  Users,
  ClipboardList,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";

const  Layout = ({ children }) => {
  const auth = useAuth() || {};
  const { user, logout } = auth;
  const { itemCount } = useCart();
  const { showWarning } = useToast();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleProtectedClick = (e, pageName) => {
    if (!user) {
      e.preventDefault();
      showWarning("Veuillez vous connecter pour accéder " + pageName);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center h-auto sm:h-16 py-3 sm:py-0 space-y-3 sm:space-y-0">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center justify-center sm:justify-start space-x-2"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                GuinéeAvicole
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-green-600 bg-green-50"
                    : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                }`}
              >
                <Home size={16} />
                <span>Accueil</span>
              </Link>
              {/* Menu déroulant Marché */}
              <div className="relative group">
                <button
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/products") || isActive("/fermes")
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  <Store size={16} />
                  <span>Marché</span>
                  <ChevronDown size={14} />
                </button>

                <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/products"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Package size={16} />
                    <span>Produits</span>
                  </Link>
                  {user && (
                    <Link
                      to="/fermes"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <MapPin size={16} />
                      <span>Fermes</span>
                    </Link>
                  )}
                </div>
              </div>

              {user && (
                <Link
                  to="/services"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/services")
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  <Briefcase size={16} />
                  <span>Services</span>
                </Link>
              )}

              {user && (
                <Link
                  to="/mes-demandes"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/mes-demandes")
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  <ClipboardList size={16} />
                  <span>Mes demandes</span>
                </Link>
              )}

              {/* Menu déroulant Communauté - Visible seulement si connecté */}
              {user && (
                <div className="relative group">
                  <button
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive("/forums") ||
                      isActive("/avis") ||
                      isActive("/chat")
                        ? "text-green-600 bg-green-50"
                        : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    <Users size={16} />
                    <span>Communauté</span>
                    <ChevronDown size={14} />
                  </button>

                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/forums"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <MessageSquare size={16} />
                      <span>Forums</span>
                    </Link>
                    <Link
                      to="/avis"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Star size={16} />
                      <span>Avis</span>
                    </Link>
                    <Link
                      to="/chat"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <MessageCircle size={16} />
                      <span>Chat</span>
                    </Link>
                    <Link
                      to="/mes-demandes"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ClipboardList size={16} />
                      <span>Mes demandes</span>
                    </Link>
                  </div>
                </div>
              )}
              {user?.role === "producteur" && (
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  <Users size={16} />
                  <span>Dashboard</span>
                </Link>
              )}
            </nav>

            {/* Actions utilisateur */}
            <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
              {user ? (
                <>
                  <Link
                    to="/cart"
                    className="hidden lg:flex relative p-1.5 sm:p-2 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative group hidden lg:block">
                    <button className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-md hover:bg-gray-100 transition-colors">
                      <User size={18} className="sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline text-sm font-medium text-gray-700">
                        {user.firstName}
                      </span>
                    </button>
                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mon Profil
                      </Link>
                      {user?.role === "producteur" && (
                        <>
                          <Link
                            to="/my-products"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Mes Produits
                          </Link>
                          <Link
                            to="/my-orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Mes Commandes
                          </Link>
                          <Link
                            to="/farms"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Mes Fermes
                          </Link>
                          <Link
                            to="/products/new"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Ajouter un produit
                          </Link>
                        </>
                      )}
                      {user?.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Administration
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="hidden lg:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
              <button
                className="lg:hidden p-1.5 sm:p-2 rounded-md hover:bg-gray-100 text-gray-700"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Ouvrir le menu"
              >
                <Menu size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-2 max-h-96 overflow-y-auto">
              {/* Boutons de connexion pour les non-connectés */}
              {!user && (
                <div className="space-y-2 pb-3 border-b border-gray-200 mb-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-3 py-2 rounded-md text-sm font-medium text-center text-gray-700 hover:bg-gray-100 border border-gray-300"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-3 py-2 rounded-md text-sm font-medium text-center bg-green-600 text-white hover:bg-green-700"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}

              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/") ? "text-green-600 bg-green-50" : "text-gray-700"
                }`}
              >
                Accueil
              </Link>
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Marché
                </div>
                <Link
                  to="/products"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/products")
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700"
                  }`}
                >
                  <Package size={16} />
                  <span>Produits</span>
                </Link>
                {user && (
                  <Link
                    to="/fermes"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/fermes")
                        ? "text-green-600 bg-green-50"
                        : "text-gray-700"
                    }`}
                  >
                    <MapPin size={16} />
                    <span>Fermes</span>
                  </Link>
                )}
              </div>
              {user && (
                <Link
                  to="/services"
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/services")
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700"
                  }`}
                >
                  Services
                </Link>
              )}
              {user && (
                <Link
                  to="/mes-demandes"
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/mes-demandes")
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700"
                  }`}
                >
                  Mes demandes
                </Link>
              )}
              {user && (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Communauté
                  </div>
                  <Link
                    to="/forums"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/forums")
                        ? "text-green-600 bg-green-50"
                        : "text-gray-700"
                    }`}
                  >
                    <MessageCircle size={16} />
                    <span>Forums</span>
                  </Link>
                  <Link
                    to="/avis"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/avis")
                        ? "text-green-600 bg-green-50"
                        : "text-gray-700"
                    }`}
                  >
                    <Star size={16} />
                    <span>Avis</span>
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/chat")
                        ? "text-green-600 bg-green-50"
                        : "text-gray-700"
                    }`}
                  >
                    <MessageSquare size={16} />
                    <span>Chat</span>
                  </Link>
                </div>
              )}
              {user && (
                <>
                  <div className="border-t border-gray-200 my-3 pt-3">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Mon Compte
                    </div>
                  </div>
                  <Link
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/cart")
                        ? "text-green-600 bg-green-50"
                        : "text-gray-700"
                    }`}
                  >
                    <ShoppingCart size={16} />
                    <span>Panier</span>
                    {itemCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/profile")
                        ? "text-green-600 bg-green-50"
                        : "text-gray-700"
                    }`}
                  >
                    <User size={16} />
                    <span>Mon Profil</span>
                  </Link>
                  {user?.role === "producteur" && (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                          isActive("/dashboard")
                            ? "text-green-600 bg-green-50"
                            : "text-gray-700"
                        }`}
                      >
                        <Users size={16} />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/farms"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                          isActive("/farms")
                            ? "text-green-600 bg-green-50"
                            : "text-gray-700"
                        }`}
                      >
                        <MapPin size={16} />
                        <span>Mes Fermes</span>
                      </Link>
                      <Link
                        to="/products/new"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                          isActive("/products/new")
                            ? "text-green-600 bg-green-50"
                            : "text-gray-700"
                        }`}
                      >
                        <Plus size={16} />
                        <span>Ajouter un produit</span>
                      </Link>
                    </>
                  )}
                  {user?.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive("/admin/dashboard")
                          ? "text-green-600 bg-green-50"
                          : "text-gray-700"
                      }`}
                    >
                      <Settings size={16} />
                      <span>Administration</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-2 text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <User size={16} />
                    <span>Se déconnecter</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>

      {/* Bouton flottant pour ajouter un produit (producteurs uniquement) */}
      {user?.role === "producteur" && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Link
            to="/products/new"
            className="bg-green-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            title="Ajouter un produit"
          >
            <Plus size={20} className="sm:w-6 sm:h-6" />
          </Link>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                GuinéeAvicole
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                La plateforme de référence pour l'aviculture en Guinée.
                Connectons les producteurs et les consommateurs.
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">
                Nos produits
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                <li>
                  <Link
                    to="/products"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Vente de poulets
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Vente de poussins
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Vente d'œufs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Aliments pour volailles
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">
                Support
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                <li>
                  <Link
                    to="/help"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Centre d'aide
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Conditions d'utilisation
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">
                Contact
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                <li>Conakry, Guinée</li>
                <li>
                  <a
                    href="mailto:contact@guineeavicole.com"
                    className="hover:underline hover:text-white transition-colors break-all"
                  >
                    contact@guineeavicole.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+224621722337"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    +224 621 72 23 37
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-300">
            <p>&copy; 2025 GuinéeAvicole. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
