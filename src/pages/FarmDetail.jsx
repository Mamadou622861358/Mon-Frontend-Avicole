import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { publicFarmService } from "../services/api";

const FarmDetail = () => {
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [contact, setContact] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await publicFarmService.getById(id);
        // Backend returns the farm object directly
        setFarm(response.data || null);
      } catch (err) {
        console.error("Erreur lors du chargement de la ferme:", err);
        setError("Impossible de charger les informations de la ferme");
      } finally {
        setLoading(false);
      }
    };

    fetchFarm();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            to="/fermes"
            className="inline-flex items-center text-green-700 hover:text-green-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux fermes
          </Link>
          <div className="p-6 bg-red-50 text-red-700 rounded-lg">
            {error || "Ferme introuvable"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link
          to="/fermes"
          className="inline-flex items-center text-green-700 hover:text-green-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux fermes
        </Link>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div>
              <img
                src={farm.image}
                alt={farm.name}
                className="w-full h-80 object-cover"
              />
              {farm.gallery && farm.gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-2 p-4">
                  {farm.gallery.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${farm.name} ${idx + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {farm.name}
                </h1>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold">{farm.rating}</span>
                  <span className="text-gray-500 ml-1">
                    ({farm.reviews} avis)
                  </span>
                </div>
              </div>
              {farm.certified && (
                <div className="inline-flex items-center text-green-600 mb-3">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Certifiée</span>
                </div>
              )}

              {/* Actions de contact */}
              <div className="flex flex-wrap gap-2 mb-4">
                {farm.phone && (
                  <a
                    href={`tel:${farm.phone}`}
                    className="inline-flex items-center px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
                  >
                    <Phone className="w-4 h-4 mr-2" /> Appeler
                  </a>
                )}
                {farm.email && (
                  <a
                    href={`mailto:${farm.email}`}
                    className="inline-flex items-center px-3 py-2 rounded border border-green-600 text-green-700 hover:bg-green-50 text-sm"
                  >
                    <Mail className="w-4 h-4 mr-2" /> Envoyer un email
                  </a>
                )}
                <Link
                  to="/chat"
                  state={{ contextFarm: { id: farm._id, name: farm.name } }}
                  className="inline-flex items-center px-3 py-2 rounded bg-green-50 text-green-700 border border-green-600 hover:bg-green-100 text-sm"
                >
                  Contacter via chat
                </Link>
              </div>

              <p className="text-gray-700 mb-6">{farm.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{farm.location}</span>
                </div>
                {farm.phone && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{farm.phone}</span>
                  </div>
                )}
                {farm.email && (
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{farm.email}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{farm.totalAnimals?.toLocaleString()} animaux</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Établie en {farm.established}</span>
                </div>
              </div>

              {/* Formulaire de contact */}
              <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Contacter la ferme
                </h3>
                {sendSuccess && (
                  <div className="mb-3 p-3 bg-green-50 text-green-700 rounded text-sm">
                    {sendSuccess}
                  </div>
                )}
                {sendError && (
                  <div className="mb-3 p-3 bg-red-50 text-red-700 rounded text-sm">
                    {sendError}
                  </div>
                )}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSendError(null);
                    setSendSuccess(null);
                    if (!contact.name || !contact.email || !contact.message) {
                      setSendError(
                        "Veuillez renseigner votre nom, email et message."
                      );
                      showError(
                        "Champs requis",
                        "Veuillez renseigner votre nom, email et message."
                      );
                      return;
                    }
                    try {
                      setSending(true);
                      const res = await publicFarmService.contact(
                        farm._id,
                        contact
                      );
                      if (res.data?.success) {
                        setSendSuccess(
                          "Votre message a été envoyé à la ferme."
                        );
                        showSuccess(
                          "Message envoyé",
                          "Votre message a été transmis à la ferme avec succès."
                        );
                        setContact({ name: "", email: "", message: "" });
                      } else {
                        const msg =
                          res.data?.message || "Échec de l'envoi du message.";
                        setSendError(msg);
                        showError("Échec de l'envoi", msg);
                      }
                    } catch (err) {
                      const msg =
                        "Impossible d'envoyer le message. Veuillez réessayer.";
                      setSendError(msg);
                      showError("Erreur réseau", msg);
                    } finally {
                      setSending(false);
                    }
                  }}
                  className="grid grid-cols-1 gap-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Votre nom"
                      value={contact.name}
                      onChange={(e) =>
                        setContact({ ...contact, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      placeholder="Votre email"
                      value={contact.email}
                      onChange={(e) =>
                        setContact({ ...contact, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <textarea
                    placeholder={`Votre message pour ${farm.name}`}
                    rows={4}
                    value={contact.message}
                    onChange={(e) =>
                      setContact({ ...contact, message: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={sending}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {sending ? "Envoi..." : "Envoyer le message"}
                    </button>
                  </div>
                </form>
              </div>

              {farm.features && farm.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Caractéristiques</h4>
                  <div className="flex flex-wrap gap-2">
                    {farm.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {farm.products && farm.products.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Produits disponibles</h4>
                  <div className="space-y-2">
                    {farm.products.map((product, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                      >
                        <span className="font-medium">{product.name}</span>
                        <span className="text-green-600 font-semibold">
                          {product.price.toLocaleString()} GNF/{product.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmDetail;
