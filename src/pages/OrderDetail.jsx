import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { orderService } from "../services/api";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getById(id);
      setOrder(response.data.data.order);
    } catch (error) {
      showError("Erreur", "Impossible de charger les détails de la commande");
      navigate("/my-orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await orderService.updateStatus(id, newStatus);
      showSuccess(
        "Statut mis à jour",
        "Le statut de la commande a été modifié"
      );
      loadOrder();
    } catch (error) {
      showError("Erreur", "Impossible de mettre à jour le statut");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5" />;
      case "preparing":
        return <Package className="w-5 h-5" />;
      case "shipped":
        return <Truck className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "confirmed":
        return "Confirmée";
      case "preparing":
        return "En préparation";
      case "shipped":
        return "Expédiée";
      case "delivered":
        return "Livrée";
      case "cancelled":
        return "Annulée";
      default:
        return "Inconnu";
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return "confirmed";
      case "confirmed":
        return "preparing";
      case "preparing":
        return "shipped";
      case "shipped":
        return "delivered";
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Commande non trouvée
            </h1>
            <Link
              to="/my-orders"
              className="text-green-600 hover:text-green-700"
            >
              Retour aux commandes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/my-orders")}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux commandes
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Commande #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                <span className="ml-2">{getStatusLabel(order.status)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Produits commandés */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Produits commandés
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product?.name || "Produit"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quantité: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Prix unitaire: {item.price?.toLocaleString()} GNF
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString()} GNF
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {order.totalAmount?.toLocaleString()} GNF
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {getNextStatus(order.status) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h2>
                <button
                  onClick={() =>
                    handleStatusUpdate(getNextStatus(order.status))
                  }
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  {getNextStatus(order.status) === "confirmed" &&
                    "Confirmer la commande"}
                  {getNextStatus(order.status) === "preparing" &&
                    "Commencer la préparation"}
                  {getNextStatus(order.status) === "shipped" &&
                    "Marquer comme expédiée"}
                  {getNextStatus(order.status) === "delivered" &&
                    "Marquer comme livrée"}
                </button>
              </div>
            )}
          </div>

          {/* Informations client et livraison */}
          <div className="space-y-6">
            {/* Informations client */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Client
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customer?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{order.customer?.phone}</span>
                </div>
              </div>
            </div>

            {/* Adresse de livraison */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Adresse de livraison
              </h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-700">
                      {order.shippingAddress?.street}
                      <br />
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.district}
                      <br />
                      {order.shippingAddress?.postalCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations de paiement */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Paiement
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Méthode</span>
                  <span className="font-medium text-gray-900">
                    {order.paymentMethod === "cod"
                      ? "Paiement à la livraison"
                      : order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut</span>
                  <span
                    className={`font-medium ${
                      order.paymentStatus === "paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.paymentStatus === "paid" ? "Payé" : "En attente"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

