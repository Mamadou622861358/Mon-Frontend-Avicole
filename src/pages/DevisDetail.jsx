import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quoteService } from '../services/api';
import { MessageSquare, ArrowLeft, Calendar, User, Phone, Mail } from 'lucide-react';

const DevisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await quoteService.getById(id);
        setData(res?.data?.data || null);
      } catch (e) {
        console.error('[DevisDetail] load failed', e);
        setError('Impossible de charger cette demande');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center text-gray-500">Chargement…</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white border rounded p-6 text-center text-gray-600">
            {error || 'Demande introuvable.'}
            <div className="mt-4">
              <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Retour</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-2xl font-bold text-gray-900">Détails de la demande</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/mes-demandes" className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">Mes demandes</Link>
            <Link to="/chat" className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 inline-flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Support
            </Link>
          </div>
        </div>

        <div className="bg-white border rounded p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center text-gray-700"><User className="w-4 h-4 mr-2" /> {data.fullName}</div>
            <div className="flex items-center text-gray-700"><Mail className="w-4 h-4 mr-2" /> {data.email}</div>
            <div className="flex items-center text-gray-700"><Phone className="w-4 h-4 mr-2" /> {data.phone || '—'}</div>
            <div className="flex items-center text-gray-700"><Calendar className="w-4 h-4 mr-2" /> {new Date(data.createdAt).toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Catégorie</div>
              <div className="font-medium">{data.category}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Statut</div>
              <div className="font-medium">{data.status}</div>
            </div>
          </div>

          {Array.isArray(data.items) && data.items.length > 0 && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Articles</div>
              <ul className="list-disc pl-5 text-gray-800">
                {data.items.map((it, idx) => (
                  <li key={idx}>{it.name}{it.quantity ? ` × ${it.quantity}` : ''}{it.notes ? ` — ${it.notes}` : ''}</li>
                ))}
              </ul>
            </div>
          )}

          {data.message && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Message</div>
              <div className="whitespace-pre-wrap text-gray-800">{data.message}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevisDetail;
