/**
 * Page de checkout - Finalisation de la commande
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total: subtotal, clearCart } = useCart();
  const { showSuccess, showError, showInfo } = useToast();
  const shippingCost = items.length > 0 ? 5000 : 0;
  const total = subtotal + shippingCost;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    district: "",
    phone: "",
    paymentMethod: "cod",
    deliveryInstructions: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      showError("Panier vide", "Ajoutez des articles avant de commander");
      return;
    }

    try {
      if (formData.paymentMethod === "cod") {
        // Paiement à la livraison: on crée localement et on confirme
        showSuccess(
          "Commande confirmée",
          "Paiement à la livraison sélectionné"
        );
        clearCart();
        navigate("/", { replace: true });
        return;
      }

      // Stubs pour paiements en ligne
      if (["om", "mobile_money"].includes(formData.paymentMethod)) {
        showInfo(
          "Paiement en ligne",
          "Intégration de paiement non encore activée. Un lien de paiement serait généré ici."
        );
        return;
      }

      if (formData.paymentMethod === "bank_transfer") {
        showInfo(
          "Virement bancaire",
          "Merci d'effectuer le virement. Votre commande sera validée à réception."
        );
        return;
      }
    } catch (err) {
      showError("Erreur", "Impossible de créer la commande pour le moment");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Finaliser votre commande
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire de livraison */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informations de livraison
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Adresse complète *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ville *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    District *
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Téléphone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor="deliveryInstructions"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Instructions de livraison
                </label>
                <textarea
                  id="deliveryInstructions"
                  name="deliveryInstructions"
                  rows="3"
                  value={formData.deliveryInstructions}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Instructions spéciales pour la livraison..."
                />
              </div>

              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Méthode de paiement *
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="cod">Paiement à la livraison (COD)</option>
                  <option value="om">Orange Money</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Virement bancaire</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Confirmer la commande
              </button>
            </form>
          </div>
        </div>

        {/* Résumé de la commande */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Résumé de la commande
            </h2>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Articles</h3>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucun article</p>
                  ) : (
                    items.map((it) => (
                      <div key={it.id} className="flex justify-between text-sm">
                        <span>
                          {it.name} ({it.quantity})
                        </span>
                        <span>
                          {(it.price * it.quantity).toLocaleString()} GNF
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{subtotal.toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison:</span>
                  <span>{shippingCost.toLocaleString()} GNF</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{total.toLocaleString()} GNF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
