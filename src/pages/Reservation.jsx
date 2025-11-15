import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Calendar, Users, Mail, Phone, FileText } from 'lucide-react';
import { quoteService } from '../services/api';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const Reservation = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const preset = {
    serviceId: query.get('serviceId') || '',
    category: query.get('category') || '',
    subject: query.get('subject') || '',
    serviceName: query.get('serviceName') || '',
  };

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    participants: 1,
    date: '',
    message: preset.subject ? `${preset.subject}` : '',
  });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (!form.fullName || !form.phone || !form.email) {
        showError('Validation', 'Nom complet, email et téléphone sont obligatoires');
        return;
      }
      setSubmitting(true);
      // Map UI category -> backend enum
      const mapCategory = (c) => {
        const k = String(c || '').toLowerCase();
        if (['equipement_pondeuses','pondeuses'].includes(k)) return 'pondeuses';
        if (['equipement_chair','chair','poulets_chair'].includes(k)) return 'chair';
        if (['equipement_reproducteurs','reproducteurs'].includes(k)) return 'reproducteurs';
        if (['abattoir_moderne','abattoir'].includes(k)) return 'abattoir';
        if (['couvoir_industriel','couvoir'].includes(k)) return 'couvoir';
        if (['usine_aliments','aliments'].includes(k)) return 'aliments';
        // Catégories de services génériques (formation/assistance/conseil/maintenance)
        return 'autre';
      };

      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        category: mapCategory(preset.category),
        items: [
          {
            name: preset.serviceName || 'Service',
            quantity: Number(form.participants) || 1,
            notes: preset.serviceId ? `serviceId=${preset.serviceId}` : '',
          },
        ],
        message: `${form.message || ''}${form.date ? `\nDate souhaitée: ${form.date}` : ''}`.trim(),
        budget: null,
      };
      const res = await quoteService.create(payload);
      const createdId = res?.data?.data?.id;
      showSuccess('Réservation envoyée', 'Nous vous recontactons très vite');
      const params = new URLSearchParams();
      if (createdId) params.set('created', createdId);
      if (preset.serviceId) params.set('serviceId', preset.serviceId);
      const suffix = params.toString() ? `?${params.toString()}` : '';
      navigate(`/mes-demandes${suffix}`);
    } catch (err) {
      console.error('[Reservation] Erreur soumission:', err);
      const msg = err?.response?.data?.message || "Impossible d'envoyer la réservation";
      showError('Erreur', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Réserver un Service</h1>
          <p className="text-gray-600 mt-2">Complétez le formulaire et nous vous confirmerons la disponibilité.</p>
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-6">
          {(preset.serviceId || preset.category) && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                {preset.subject || 'Service sélectionné'}
                {preset.category ? ` • Catégorie: ${preset.category}` : ''}
                {preset.serviceId ? ` • ID: ${preset.serviceId}` : ''}
              </p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input name="fullName" value={form.fullName} onChange={onChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input name="phone" value={form.phone} onChange={onChange} required className="w-full pl-9 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" name="email" value={form.email} onChange={onChange} required className="w-full pl-9 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="number" min={1} name="participants" value={form.participants} onChange={onChange} className="w-full pl-9 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date souhaitée</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="date" name="date" value={form.date} onChange={onChange} className="w-full pl-9 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <textarea rows={4} name="message" value={form.message} onChange={onChange} className="w-full pl-9 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Annuler</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">
                {submitting ? 'Envoi…' : 'Envoyer la demande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reservation;
