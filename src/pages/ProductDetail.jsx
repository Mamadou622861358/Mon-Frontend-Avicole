/**
 * Page de détail d'un produit
 */

import React, { useState } from "react";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { productService } from "../../services/api";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery([
    "product",
    id,
  ], async () => {
    const resp = await productService.getById(id);
    // L'API retourne généralement { success, data }
    const base = resp?.data ?? resp;
    const data = base?.data ?? base;
    // Certains backends renvoient { data: { product: {...} } } ou { product: {...} }
    const productObj = data?.product ?? data;
    return productObj;
  }, { enabled: !!id });

  const handleAddToCart = () => {
    // TODO: Implémenter l'ajout au panier
    console.log("Ajouter au panier:", { product: product._id, quantity });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Produit non trouvé
          </h2>
          <p className="text-gray-600 mb-4">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link
            to="/products"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="text-gray-700 hover:text-green-600">
              Accueil
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/products"
                className="text-gray-700 hover:text-green-600"
              >
                Produits
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{product.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images du produit */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 w-full">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Aucune image disponible</span>
              </div>
            )}
          </div>

          {/* Galerie d'images (si plusieurs images) */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-75 transition-opacity"
                />
              ))}
            </div>
          )}
        </div>

        {/* Informations du produit */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-lg text-gray-600">{product.description}</p>
          </div>

          {/* Prix et stock */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-green-600">
                {(Number(product.price ?? 0)).toLocaleString('fr-FR')} GNF
              </span>
              <span className="text-sm text-gray-500">
                / {product.unit || "unité"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.stock > 0
                  ? `En stock (${product.stock})`
                  : "Rupture de stock"}
              </span>
              <span className="text-sm text-gray-500 capitalize">
                Catégorie: {typeof product.category === 'string' ? product.category : (product.category?.name || '—')}
              </span>
            </div>
          </div>

          {/* Quantité et ajout au panier */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Quantité
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 text-center border border-gray-300 rounded-md py-2"
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Ajouter au panier
              </button>
            </div>
          )}

          {/* Informations du producteur */}
          {product.producer && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Informations du producteur
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">
                  {product.producer.firstName} {product.producer.lastName}
                </p>
                {product.producer.farmName && (
                  <p className="text-gray-600 text-sm">
                    Ferme: {product.producer.farmName}
                  </p>
                )}
                {product.farm && (
                  <p className="text-gray-600 text-sm">
                    Localisation: {product.farm.city}, {product.farm.district}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Spécifications */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Spécifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                        <span className="block text-gray-900">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
