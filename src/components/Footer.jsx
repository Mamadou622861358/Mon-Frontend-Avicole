import {
  ExternalLink,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = 2025;

  const quickLinks = [
    { name: "Accueil", href: "/" },
    { name: "Produits", href: "/products" },
    { name: "Forums", href: "/forums" },
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const helpLinks = [
    { name: "Centre d'aide", href: "/help" },
    { name: "FAQ", href: "/faq" },
    { name: "Conditions d'utilisation", href: "/terms" },
    { name: "Politique de confidentialité", href: "/privacy" },
    { name: "Guide d'utilisation", href: "/guide" },
  ];

  const producerLinks = [
    { name: "Devenir producteur", href: "/register?role=producteur" },
    { name: "Gestion des fermes", href: "/farm-management" },
    { name: "Gestion des produits", href: "/product-management" },
    { name: "Statistiques", href: "/stats" },
    { name: "Support producteur", href: "/producer-support" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com/guineeavicole",
      icon: Facebook,
    },
    {
      name: "Twitter",
      href: "https://twitter.com/guineeavicole",
      icon: Twitter,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/guineeavicole",
      icon: Instagram,
    },
    {
      name: "Linkedin",
      href: "https://linkedin.com/guineeavicole",
      icon: Linkedin,
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo et description */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="bg-green-600 text-white p-1.5 sm:p-2 rounded-lg">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-lg sm:text-xl font-bold">GuinéeAvicole</span>
            </div>
            <p className="text-gray-300 mb-3 sm:mb-4 max-w-md text-sm sm:text-base leading-relaxed">
              La plateforme de référence pour l'aviculture en Guinée. Connectons nos producteurs et consommateurs pour une collaboration durable.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title={social.name}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Navigation</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide et support */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Aide & Support</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Producteurs */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Pour les producteurs</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {producerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-gray-300 text-sm">
              Restez informé de nos actualités
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Votre email"
                className="px-3 py-2 bg-gray-800 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 transition-colors text-sm">
                S'abonner
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            {currentYear} GuinéeAvicole. Tous droits réservés. |
            <Link to="/terms" className="hover:text-green-400 ml-1">
              Conditions d'utilisation
            </Link>{" "}
            |
            <Link to="/privacy" className="hover:text-green-400 ml-1">
              Politique de confidentialité
            </Link>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Développé avec ❤️ pour l'aviculture guinéenne
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
