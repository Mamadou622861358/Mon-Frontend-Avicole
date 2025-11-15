import { Eye, ShoppingCart } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({
  product,
  onAddToCart,
  showActions = true,
  className = "",
}) => {
  // Normalisation et valeurs par défaut pour éviter les erreurs runtime
  const safeId = product?.id || product?._id;
  const name = product?.name || "Produit";
  const description = product?.description || "";
  const price = Number(product?.price ?? 0);
  const stock = Number(product?.stock ?? 0);
  const image = product?.image;
  const category = typeof product?.category === "string" ? product?.category : (product?.category?.name || null);
  const producer = product?.producer;

  const isOutOfStock = stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Image du produit */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-48 w-full object-cover hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Aucune image</span>
          </div>
        )}
      </div>

      {/* Informations du produit */}
      <div className="p-4">
        {/* Catégorie */}
        {category && (
          <div className="mb-2">
            <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {category}
            </span>
          </div>
        )}

        {/* Nom et description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>

        {/* Producteur */}
        {producer && (
          <div className="text-sm text-gray-500 mb-3">
            <span>
              Par: {producer.firstName} {producer.lastName}
            </span>
          </div>
        )}

        {/* Prix et stock */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-green-600">
            {price.toLocaleString('fr-FR')} GNF
          </span>
          <span
            className={`text-sm px-2 py-1 rounded-full ${
              isOutOfStock
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {isOutOfStock ? "Rupture" : "En stock"}
          </span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <Link
              to={`/products/${safeId}`}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir détails
            </Link>
            <button
              className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              title={
                isOutOfStock
                  ? "Produit en rupture de stock"
                  : "Ajouter au panier"
              }
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

