import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ClipboardList, Calendar, MessageSquare } from 'lucide-react';
import { quoteService } from '../services/api';

const MesDemandes = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const lastServiceId = params.get('serviceId');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await quoteService.getMine();
        const payload = res?.data;
        const list = payload?.data ?? [];
        setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('[MesDemandes] Chargement échoué:', e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mes demandes</h1>
          <p className="text-gray-600">Suivi de vos réservations et demandes de contact.</p>
        </div>

        {lastServiceId && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">Votre dernière demande a été envoyée avec succès. ID service: <span className="font-medium">{lastServiceId}</span></p>
          </div>
        )}

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800">Historique</h2>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">Chargement…</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-gray-500">Aucune demande pour le moment.</div>
          ) : (
            <div className="divide-y">
              {items.map((it) => (
                <div key={it.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-gray-900">{it.category} • {it.status}</div>
                    <div className="text-sm text-gray-600 mt-1">Budget: {it.budget ? `${Number(it.budget).toLocaleString()} GNF` : '—'} • Articles: {it.itemsCount ?? 0}</div>
                    <div className="text-xs text-gray-500 mt-1">Créée le {new Date(it.createdAt).toLocaleString()}</div>
                  </div>
                  <Link to={`/devis/${it.id}`} className="text-green-600 hover:text-green-700 text-sm">Détails</Link>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <Link to="/services" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Réserver un autre service</Link>
            <Link to="/chat" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Support
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Bientôt: calendrier des réservations</span>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-700">Notifications par email/SMS à la confirmation.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MesDemandes;
