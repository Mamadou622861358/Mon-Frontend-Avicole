import {
  BarChart3,
  HelpCircle,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Settings,
  ShoppingCart,
  User,
  X,
  BookOpen,
  Lock,
  Star,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";

const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { showInfo } = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { name: "Accueil", href: "/", icon: Home, requireAuth: false },
    { name: "Produits", href: "/products", icon: Package, requireAuth: false },
    { name: "Projets industriels", href: "/projets-industriels", icon: BookOpen, requireAuth: true },
    { name: "Devis", href: "/devis", icon: BookOpen, requireAuth: true },
    { name: "Services", href: "/services", icon: BookOpen, requireAuth: true },
    { name: "Mes demandes", href: "/mes-demandes", icon: ClipboardList, requireAuth: true },
    { name: "Fermes", href: "/fermes", icon: MapPin, requireAuth: true },
    { name: "Forums", href: "/forums", icon: MessageCircle, requireAuth: true },
    { name: "Avis", href: "/avis", icon: Star, requireAuth: true },
    { name: "Chat", href: "/chat", icon: MessageSquare, requireAuth: true },
  ];

  const producerItems = [
    { name: "Tableau de bord", href: "/dashboard", icon: BarChart3 },
    { name: "Gestion des fermes", href: "/farm-management", icon: MapPin },
    {
      name: "Gestion des produits",
      href: "/product-management",
      icon: Package,
    },
    { name: "Statistiques", href: "/stats", icon: BarChart3 },
    { name: "Profil", href: "/profile", icon: Settings },
  ];

  const clientItems = [
    { name: "Mon profil", href: "/profile", icon: User },
    { name: "Mes commandes", href: "/my-orders", icon: Package },
    { name: "Panier", href: "/cart", icon: ShoppingCart },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-green-600 text-white p-1.5 sm:p-2 rounded-lg">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              GuinéeAvicole
            </span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex space-x-4">
            {navigationItems.map((item) => {
              const isLocked = item.requireAuth && !user;
              return isLocked ? (
                <Link
                  key={item.name}
                  to="/login"
                  title="Connectez-vous pour accéder"
                  className="relative text-gray-400 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center"
                  onClick={() => showInfo('Authentification requise', 'Veuillez vous connecter pour accéder à cette page.', 3000)}
                >
                  <Lock className="w-4 h-4 mr-1" />
                  {item.name}
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    Connectez-vous
                  </span>
                </Link>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions desktop */}
          <div className="hidden lg:flex items-center space-x-2 sm:space-x-4">
            {user && (
              <Link
                to="/cart"
                className="relative p-1.5 sm:p-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {cartItems.length > 9 ? "9+" : cartItems.length}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative group">
                <button className="flex items-center text-gray-600 hover:text-green-600">
                  <User className="h-6 w-6" />
                  <span className="ml-2 text-sm font-medium">{user.firstName}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mon profil
                  </Link>
                  <Link
                    to="/mes-demandes"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mes demandes
                  </Link>
                  {user.role === "producteur" && (
                    <>
                      <Link
                        to="/farm-management"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mes fermes
                      </Link>
                      <Link
                        to="/product-management"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mes produits
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Bouton hamburger mobile */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-1.5 sm:p-2 text-gray-700 hover:text-green-600 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {/* Navigation principale */}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isLocked = item.requireAuth && !user;
              return isLocked ? (
                <Link
                  key={item.name}
                  to="/login"
                  onClick={() => { showInfo('Authentification requise', 'Veuillez vous connecter pour accéder à cette page.', 3000); closeMobileMenu(); }}
                  className="flex items-center text-gray-400 hover:text-gray-600 px-3 py-2 text-base font-medium"
                >
                  <Lock className="h-5 w-5 mr-3" />
                  {item.name}
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">Connectez-vous</span>
                </Link>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className="flex items-center text-gray-600 hover:text-green-600 px-3 py-2 text-base font-medium"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}

            {/* Séparateur */}
            <div className="border-t border-gray-200 my-2"></div>

            {user ? (
              <>
                {/* Panier */}
                <Link
                  to="/cart"
                  onClick={closeMobileMenu}
                  className="flex items-center text-gray-600 hover:text-green-600 px-3 py-2 text-base font-medium"
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Panier
                  {cartItems.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>

                {/* Menu utilisateur */}
                <div className="border-t border-gray-200 my-2"></div>

                {user.role === "producteur" ? (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Producteur
                    </div>
                    {producerItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={closeMobileMenu}
                          className="flex items-center text-gray-600 hover:text-green-600 px-3 py-2 text-base font-medium"
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Client
                    </div>
                    {clientItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={closeMobileMenu}
                          className="flex items-center text-gray-600 hover:text-green-600 px-3 py-2 text-base font-medium"
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.name}
                        </Link>
                      );
                    })}
                    <Link
                      to="/mes-demandes"
                      onClick={closeMobileMenu}
                      className="flex items-center text-gray-600 hover:text-green-600 px-3 py-2 text-base font-medium"
                    >
                      <ClipboardList className="h-5 w-5 mr-3" />
                      Mes demandes
                    </Link>
                  </>
                )}

                {/* Déconnexion */}
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="flex items-center w-full text-left text-gray-600 hover:text-red-600 px-3 py-2 text-base font-medium"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center text-gray-600 hover:text-green-600 px-3 py-2 text-base font-medium"
                >
                  <User className="h-5 w-5 mr-3" />
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-green-700"
                >
                  <User className="h-5 w-5 mr-3" />
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

