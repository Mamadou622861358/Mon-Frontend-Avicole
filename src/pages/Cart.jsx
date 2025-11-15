/**
 * Page du panier d'achat
 */

import { Minus, Plus, Trash2 } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const Cart = () => {
  const {
    items: cartItems,
    total: subtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const shippingCost = 5000;
  const total = subtotal + shippingCost;

  const handleUpdateQuantity = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Panier</h1>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Votre panier est vide
          </h2>
          <p className="text-gray-600 mb-8">
            Découvrez nos produits et commencez vos achats.
          </p>
          <Link
            to="/products"
            className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Voir nos produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des articles */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Articles du panier ({cartItems.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 flex items-center space-x-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>

                  {/* Informations */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{item.description}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Prix unitaire: {item.price.toLocaleString()} GNF
                    </p>
                  </div>

                  {/* Quantité */}
                  <div className="flex items-center space-x-2">
                    <button
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Prix total */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()} GNF
                    </p>
                  </div>

                  {/* Supprimer */}
                  <button
                    className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé et checkout */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Résumé de la commande
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="text-gray-900">
                  {subtotal.toLocaleString()} GNF
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="text-gray-900">
                  {shippingCost.toLocaleString()} GNF
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-green-600">
                    {total.toLocaleString()} GNF
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors text-center block"
            >
              Procéder au paiement
            </Link>

            <div className="mt-4 text-center">
              <Link
                to="/products"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Continuer les achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
