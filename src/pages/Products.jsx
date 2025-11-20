import { Search, ShoppingCart } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { productService } from "../../services/api";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, itemCount } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Charger les produits depuis la base de données
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAll();
        // L'API retourne {success: true, data: [...]}
        const productsData = response.data?.data || response.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        setError('Impossible de charger les produits');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    { value: "", label: "Toutes les catégories" },
    { value: "poulets", label: "Poulets" },
    { value: "poussins", label: "Poussins" },
    { value: "oeufs", label: "Œufs" },
    { value: "aliments", label: "Aliments" },
    { value: "services", label: "Services" },
  ];

  // Filtrer les produits
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const catValue = typeof product.category === 'string' ? product.category : (product.category?.slug || product.category?.name || '');
    const matchesCategory = !selectedCategory || catValue === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    if (!user) {
      showError(
        "Connexion requise",
        "Veuillez vous connecter pour ajouter des produits au panier"
      );
      return;
    }

    addToCart(product, 1);
    showSuccess("Produit ajouté", `"${product.name}" a été ajouté au panier !`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="text-gray-600">Chargement des produits...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* En-tête */}
      <div className="text-center px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Nos Produits Avicoles
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Découvrez notre sélection de produits frais et de qualité pour vos besoins avicoles
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mx-4 sm:mx-0">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-0 sm:min-w-[200px]"
          >
            <option value="">Toutes les catégories</option>
            <option value="poulets">Poulets</option>
            <option value="oeufs">Œufs</option>
            <option value="poussins">Poussins</option>
            <option value="aliments">Aliments</option>
            <option value="equipements">Équipements</option>
          </select>
        </div>

        {/* Bouton panier */}
        <div>
          <Link
            to="/cart"
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Panier
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Grille de produits */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id || product._id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Statistiques */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Statistiques
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {filteredProducts.length}
            </div>
            <div className="text-gray-600">Produits trouvés</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {filteredProducts
                .reduce((sum, p) => sum + (Number(p.price ?? 0)), 0)
                .toLocaleString('fr-FR')}
            </div>
            <div className="text-gray-600">GNF total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {filteredProducts.filter((p) => (p.stock || 0) > 0).length}
            </div>
            <div className="text-gray-600">En stock</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
