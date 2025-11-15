import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Search, User, Calendar, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { publicReviewService, productService, publicFarmService, adminService, farmService } from '../services/api';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [targetModel, setTargetModel] = useState('Product');
  const [targetId, setTargetId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [targetOptions, setTargetOptions] = useState([]); // {value: id, label: name}
  const [targetSearch, setTargetSearch] = useState('');

  const isValidObjectId = (v) => /^[a-fA-F0-9]{24}$/.test(String(v || ''));

  useEffect(() => {
    const fetchReviews = async () => {
      setErrorMsg('');
      if (!targetId || !targetModel) {
        setReviews([]);
        setLoading(false);
        return;
      }
      if (!isValidObjectId(targetId)) {
        setErrorMsg('Identifiant de cible invalide. Sélectionnez une cible dans la liste ou collez un ObjectId valide.');
        setReviews([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const params = { targetModel, limit: 20, page: 1 };
        if (user?.role === 'admin') params.includeAll = true;
        const response = await publicReviewService.getByTarget(targetId, params);
        const payload = response?.data?.data;
        const list = payload?.reviews ?? payload?.data?.reviews ?? payload ?? [];
        setReviews(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Erreur lors du chargement des avis:', error);
        setErrorMsg(error?.response?.data?.message || "Impossible de charger les avis");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [targetId, targetModel, user]);

  // Charger options de cibles selon targetModel (Option 2)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setOptionsLoading(true);
        setTargetOptions([]);
        // Petite recherche côté serveur si disponible, sinon filtrage client ensuite
        if (targetModel === 'Product') {
          const res = await productService.getAll({ page: 1, limit: 20, search: targetSearch || undefined });
          const payload = res?.data;
          const list = payload?.data || payload?.products || payload?.items || [];
          const optsRaw = (Array.isArray(list) ? list : []).map(p => ({ value: String(p._id || p.id || ''), label: p.name || p.title || p.slug || String(p._id || p.id || '') }));
          const opts = optsRaw.filter(o => isValidObjectId(o.value));
          setTargetOptions(opts);
          // Sélection par défaut ou réinitialisation si l'actuelle n'existe pas
          if (!targetId && opts.length > 0) {
            setTargetId(String(opts[0].value));
          } else if (targetId && !opts.some(o => o.value === targetId)) {
            setTargetId(opts.length > 0 ? String(opts[0].value) : '');
          }
        } else {
          // Essayer plusieurs variantes de recherche côté public
          let res, payload, list = [];
          const attempts = [
            { page: 1, limit: 20 },
            { page: 1, limit: 20, search: targetSearch || undefined },
            { page: 1, limit: 20, q: targetSearch || undefined },
            { page: 1, limit: 20, name: targetSearch || undefined },
          ];
          for (const params of attempts) {
            try {
              res = await publicFarmService.getAll(params);
              payload = res?.data;
              list = payload?.data || payload?.farms || payload?.items || [];
              if (Array.isArray(list) && list.length) break;
            } catch (_) {}
          }
          // Fallback admin si admin et toujours vide
          if ((!Array.isArray(list) || list.length === 0) && user?.role === 'admin') {
            try {
              const adminRes = await adminService.getFarms({ page: 1, limit: 20, search: targetSearch || undefined });
              const adminPayload = adminRes?.data;
              list = adminPayload?.data || adminPayload?.farms || adminPayload?.items || [];
            } catch (_) {}
          }
          // Fallback authentifié (non-admin): utiliser farmService (protégé)
          if ((!Array.isArray(list) || list.length === 0) && user) {
            try {
              const authRes = await farmService.getAll({ page: 1, limit: 20, search: targetSearch || undefined });
              const authPayload = authRes?.data;
              list = authPayload?.data || authPayload?.farms || authPayload?.items || [];
            } catch (_) {}
          }
          const optsRaw = (Array.isArray(list) ? list : []).map(f => ({ value: String(f._id || f.id || ''), label: f.name || f.title || f.slug || String(f._id || f.id || '') }));
          const opts = optsRaw.filter(o => isValidObjectId(o.value));
          setTargetOptions(opts);
          if (!targetId && opts.length > 0) {
            setTargetId(String(opts[0].value));
          } else if (targetId && !opts.some(o => o.value === targetId)) {
            setTargetId(opts.length > 0 ? String(opts[0].value) : '');
          }
        }
      } catch (e) {
        console.error('Chargement des options de cible échoué', e);
        setErrorMsg("Impossible de charger la liste des cibles. Réessayez ou modifiez votre recherche.");
      } finally {
        setOptionsLoading(false);
      }
    };
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetModel, targetSearch]);

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 cursor-pointer ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
        onClick={() => interactive && onRatingChange && onRatingChange(index + 1)}
      />
    ));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      if (!targetId) {
        setErrorMsg('Veuillez sélectionner une cible valide.');
        return;
      }
      if (!isValidObjectId(targetId)) {
        setErrorMsg('Identifiant de cible invalide.');
        return;
      }
      if (!Number.isInteger(Number(newReview.rating)) || Number(newReview.rating) < 1 || Number(newReview.rating) > 5) {
        setErrorMsg('La note doit être un entier entre 1 et 5.');
        return;
      }
      if (!newReview.title || newReview.title.trim().length < 5) {
        setErrorMsg('Le titre doit contenir au moins 5 caractères.');
        return;
      }
      if (!newReview.comment || newReview.comment.trim().length < 10) {
        setErrorMsg('Le commentaire doit contenir au moins 10 caractères.');
        return;
      }
      // Vérifier que la cible provient bien des options proposées
      if (!targetOptions.some(o => o.value === targetId)) {
        setErrorMsg("Veuillez sélectionner une cible dans la liste proposée.");
        return;
      }

      const reviewData = {
        target: targetId,
        targetModel,
        rating: Number(newReview.rating),
        title: newReview.title,
        comment: newReview.comment,
      };

      const response = await publicReviewService.create(reviewData);
      const created = response?.data?.data || response?.data;
      // Recharger la liste officielle (les avis créés sont en pending, ils n'apparaîtront qu'après approbation)
      setShowAddReview(false);
      setNewReview({ rating: 5, title: '', comment: '' });
      setErrorMsg('Votre avis a été soumis et est en attente de modération.');
      // Optionnel: recharger
      try {
        const refreshed = await publicReviewService.getByTarget(targetId, { targetModel, limit: 20, page: 1 });
        const payload = refreshed?.data?.data;
        const list = payload?.reviews ?? payload?.data?.reviews ?? payload ?? [];
        setReviews(Array.isArray(list) ? list : []);
      } catch {}
    } catch (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
      const backend = error?.response?.data;
      if (backend?.errors && Array.isArray(backend.errors) && backend.errors.length) {
        const first = backend.errors[0];
        setErrorMsg(first?.msg || backend?.message || 'Données invalides.');
      } else {
        setErrorMsg(backend?.message || 'Impossible de créer cet avis. Vérifiez les champs et que vous êtes bien connecté.');
      }
    }
  };

  const toText = (v) => typeof v === 'string' ? v : (v?.name || v?.fullName || v?.email || v?._id || '');
  const filteredReviews = (Array.isArray(reviews) ? reviews : []).filter(review => {
    const matchesSearch = (review.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (review.comment?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (toText(review.author).toLowerCase()).includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || String(review.rating ?? '').toString() === filterRating;
    return matchesSearch && matchesRating;
  });

  const averageRating = (Array.isArray(reviews) && reviews.length > 0)
    ? (reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const moderate = async (rev, status) => {
    try {
      if (status === 'rejected') {
        const reason = window.prompt('Raison du rejet (optionnel):', '');
        await publicReviewService.updateStatus(rev._id || rev.id, 'rejected', reason || undefined);
      } else {
        await publicReviewService.updateStatus(rev._id || rev.id, 'approved');
      }
      // refresh list
      const params = { targetModel, limit: 20, page: 1 };
      if (user?.role === 'admin') params.includeAll = true;
      const refreshed = await publicReviewService.getByTarget(targetId, params);
      const payload = refreshed?.data?.data;
      const list = payload?.reviews ?? payload?.data?.reviews ?? payload ?? [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Modération échouée', e);
      setErrorMsg(e?.response?.data?.message || 'Impossible de mettre à jour le statut de cet avis');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Chargement des avis...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Avis Clients</h1>
          <p className="text-gray-600">Découvrez les avis approuvés. Sélectionnez une cible pour charger les avis.</p>
        </div>

        {/* Statistiques des avis */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating}</div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-gray-600">Note moyenne</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">{reviews.length}</div>
              <p className="text-gray-600">Avis clients</p>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Cible</div>
              <div className="flex flex-col items-center gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <select value={targetModel} onChange={(e)=>{setTargetModel(e.target.value); setTargetId('');}} className="px-2 py-1 border rounded">
                    <option value="Product">Produit</option>
                    <option value="Farm">Ferme</option>
                  </select>
                  <input value={targetSearch} onChange={(e)=>{ setTargetSearch(e.target.value); setTargetId(''); }} placeholder={`Rechercher ${targetModel==='Product'?'un produit':'une ferme'}...`} className="px-2 py-1 border rounded w-48" />
                </div>
                <div className="flex items-center gap-2">
                  <select value={targetId} onChange={(e)=>setTargetId(e.target.value)} className="px-2 py-1 border rounded w-64">
                    {optionsLoading && <option>Chargement…</option>}
                    {!optionsLoading && targetOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          {errorMsg && <div className="mt-3 text-center text-sm text-red-600">{errorMsg}</div>}
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher dans les avis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Toutes les notes</option>
                <option value="5">5 étoiles</option>
                <option value="4">4 étoiles</option>
                <option value="3">3 étoiles</option>
                <option value="2">2 étoiles</option>
                <option value="1">1 étoile</option>
              </select>
              <button
                onClick={() => setShowAddReview(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Laisser un avis
              </button>
            </div>
          </div>
        </div>

        {/* Liste des avis */}
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review._id || review.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
                  {toText(review.author).substring(0,1).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{toText(review.author)}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 flex items-center"><Calendar className="w-4 h-4 mr-1" /> {review.createdAt ? new Date(review.createdAt).toLocaleString() : ''}</span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      {targetModel}
                      {/* Badge statut pour admin */}
                      {user?.role === 'admin' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${review.status === 'approved' ? 'bg-green-100 text-green-700' : review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {review.status || 'pending'}
                        </span>
                      )}
                    </span>
                    <button className="flex items-center text-sm text-gray-500 hover:text-gray-700" onClick={async()=>{
                      try {
                        const res = await publicReviewService.markHelpful(review._id || review.id, true);
                        // Optionnel: relire la liste
                        const params = { targetModel, limit: 20, page: 1 };
                        if (user?.role === 'admin') params.includeAll = true;
                        const refreshed = await publicReviewService.getByTarget(targetId, params);
                        const payload = refreshed?.data?.data;
                        const list = payload?.reviews ?? payload?.data?.reviews ?? payload ?? [];
                        setReviews(Array.isArray(list) ? list : []);
                      } catch (e) {
                        console.error('markHelpful failed', e);
                      }
                    }}>
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Utile ({review.helpfulCount ?? 0})
                    </button>
                  </div>

                  {/* Actions admin */}
                  {user?.role === 'admin' && (
                    <div className="mt-3 flex items-center gap-2 justify-end">
                      {review.status !== 'approved' && (
                        <button onClick={()=>moderate(review, 'approved')} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700">Approuver</button>
                      )}
                      {review.status !== 'rejected' && (
                        <button onClick={()=>moderate(review, 'rejected')} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700">Rejeter</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal d'ajout d'avis */}
        {showAddReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4">Laisser un avis</h2>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <div className="flex">
                    {renderStars(newReview.rating, true, (rating) => 
                      setNewReview(prev => ({ ...prev, rating }))
                    )}
                  </div>
                </div>
                
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de cible</label>
                    <select value={targetModel} onChange={(e)=>{setTargetModel(e.target.value); setTargetId('');}} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                      <option value="Product">Produit</option>
                      <option value="Farm">Ferme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner la cible</label>
                    <select value={targetId} onChange={(e)=>setTargetId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                      {optionsLoading && <option>Chargement…</option>}
                      {!optionsLoading && targetOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddReview(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Publier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
