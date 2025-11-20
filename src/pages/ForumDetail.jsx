import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { forumService } from '../../services/api';
import { MessageCircle, Eye, ThumbsUp, User, Clock, Send } from 'lucide-react';

const safeAuthor = (obj) => {
  if (!obj) return 'Utilisateur';
  if (typeof obj === 'string') return obj;
  return obj.name || obj.fullName || (obj.prenom && obj.nom && `${obj.prenom} ${obj.nom}`.trim()) || obj.email || 'Utilisateur';
};

const ForumDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);

  const load = async (noIncrement = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await forumService.getById(id, noIncrement ? { noIncrementView: true } : undefined);
      const d = res?.data?.data || res?.data || null;
      setData(d);
    } catch (e) {
      console.error('[ForumDetail] load failed', e);
      setError("Impossible de charger ce sujet");
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();
  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Scroll automatique vers #replies si présent
  useEffect(() => {
    if (location.hash === '#replies') {
      const el = document.getElementById('replies');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    }
  }, [location, data]);

  const replies = useMemo(() => {
    const list = data?.replies || data?.comments || [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  const likesCount = useMemo(() => {
    if (!data) return 0;
    if (typeof data.likesCount === 'number') return data.likesCount;
    if (Array.isArray(data.likes)) return data.likes.length;
    return data.likes || 0;
  }, [data]);

  const viewsCount = useMemo(() => {
    if (!data) return 0;
    return typeof data.views === 'number' ? data.views : 0;
  }, [data]);

  const onSubmitReply = async (e) => {
    e.preventDefault();
    if (!reply || reply.trim().length < 5) return;
    try {
      setSubmitting(true);
      await forumService.addReply(id, { content: reply.trim() });
      setReply('');
      await load(true);
    } catch (e) {
      console.error('[ForumDetail] addReply failed', e);
      alert("Impossible d'ajouter la réponse (vérifiez la longueur)");
    } finally {
      setSubmitting(false);
    }
  };

  const onToggleLike = async () => {
    try {
      setTogglingLike(true);
      await forumService.toggleLike(id);
      await load(true);
    } catch (e) {
      console.error('[ForumDetail] toggleLike failed', e);
    } finally {
      setTogglingLike(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500">Chargement…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white border rounded p-6 text-center text-gray-600">{error || 'Sujet introuvable.'}</div>
        </div>
      </div>
    );
  }

  const author = safeAuthor(data.author) || safeAuthor(data.user);
  const createdAt = data.createdAt ? new Date(data.createdAt).toLocaleString() : '';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="bg-white border rounded p-6">
          <h1 className="text-2xl font-bold text-gray-900">{typeof data.title === 'string' ? data.title : String(data.title || '')}</h1>
          <div className="mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-4">
            <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {author}</span>
            {createdAt && <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {createdAt}</span>}
            <span className="flex items-center"><Eye className="w-4 h-4 mr-1" /> {viewsCount} vues</span>
            <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-1" /> {replies.length} réponses</span>
          </div>
          <div className="mt-4 text-gray-800 whitespace-pre-wrap">
            {typeof data.content === 'string' ? data.content : String(data.content || '')}
          </div>
          <div className="mt-4">
            <button onClick={onToggleLike} disabled={togglingLike} className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60">
              <ThumbsUp className="w-4 h-4 mr-2" /> J'aime ({likesCount})
            </button>
          </div>
        </div>

        <div className="bg-white border rounded p-6" id="replies">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Réponses</h2>
          {replies.length === 0 ? (
            <div className="text-gray-500">Aucune réponse pour l'instant.</div>
          ) : (
            <div className="space-y-4">
              {replies.map((r, idx) => {
                const rAuthor = safeAuthor(r.author) || safeAuthor(r.user);
                const rDate = r.createdAt ? new Date(r.createdAt).toLocaleString() : '';
                return (
                  <div key={r._id || r.id || idx} className="border rounded p-4">
                    <div className="text-sm text-gray-600 flex items-center gap-4">
                      <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {rAuthor}</span>
                      {rDate && <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {rDate}</span>}
                    </div>
                    <div className="mt-2 text-gray-800 whitespace-pre-wrap">
                      {typeof r.content === 'string' ? r.content : String(r.content || '')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border rounded p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ajouter une réponse</h3>
          <form onSubmit={onSubmitReply} className="space-y-3">
            <textarea
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Écrivez votre réponse (min. 5 caractères)"
              required
            />
            <button type="submit" disabled={submitting} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60">
              <Send className="w-4 h-4 mr-2" /> Publier la réponse
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForumDetail;
