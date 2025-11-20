import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { quoteService } from '../../services/api';

const QuoteRequest = () => {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', company: '', category: '', budget: '', message: '' });
  const [items, setItems] = useState([{ name: '', quantity: 1 }]);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.category || !form.message) {
      showError('Champs requis', 'Nom, email, catégorie et message sont requis.');
      return;
    }
    try {
      setSending(true);
      const payload = {
        ...form,
        budget: form.budget ? Number(form.budget) : null,
        items: items.filter(it => it.name && it.quantity).map(it => ({ name: it.name, quantity: Number(it.quantity) || 1 }))
      };
      const { data } = await quoteService.create(payload);
      if (data?.status === 'success') {
        showSuccess('Demande envoyée', 'Votre demande de devis a été enregistrée.');
        setForm({ fullName: '', email: '', phone: '', company: '', category: '', budget: '', message: '' });
        setItems([{ name: '', quantity: 1 }]);
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (err) {
      showError('Échec de l\'envoi', err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Demande de devis</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Décrivez votre projet pour recevoir une proposition personnalisée.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:gap-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Nom complet" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/>
          <input className="border rounded px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Téléphone (optionnel)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
          <input className="border rounded px-3 py-2" placeholder="Société (optionnel)" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select className="border rounded px-3 py-2" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
            <option value="">Sélectionnez une catégorie</option>
            <option value="couvoir">Couvoir</option>
            <option value="abattoir">Abattoir</option>
            <option value="reproducteurs">Reproducteurs</option>
            <option value="aliments">Fabrication d'aliments</option>
            <option value="pondeuses">Pondeuses</option>
            <option value="chair">Poulets de chair</option>
            <option value="autre">Autre</option>
          </select>
          <input className="border rounded px-3 py-2" placeholder="Budget estimé (optionnel)" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-700">Équipements souhaités (optionnel)</div>
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-6 gap-2">
              <input className="col-span-4 border rounded px-3 py-2" placeholder="Nom de l'équipement" value={it.name} onChange={e=>{
                const arr = [...items]; arr[idx].name = e.target.value; setItems(arr);
              }}/>
              <input className="col-span-2 border rounded px-3 py-2" type="number" min="1" placeholder="Quantité" value={it.quantity} onChange={e=>{
                const arr = [...items]; arr[idx].quantity = e.target.value; setItems(arr);
              }}/>
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" className="px-3 py-1.5 text-sm border rounded" onClick={()=>setItems([...items, { name:'', quantity:1 }])}>Ajouter un équipement</button>
            {items.length > 1 && (
              <button type="button" className="px-3 py-1.5 text-sm border rounded" onClick={()=>setItems(items.slice(0, -1))}>Retirer le dernier</button>
            )}
          </div>
        </div>
        <textarea className="border rounded px-3 py-2" rows={5} placeholder="Détails du projet" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/>
        <div className="flex justify-end">
          <button disabled={sending} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
            {sending ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteRequest;
