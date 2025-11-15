import React, { useState, useEffect } from 'react';
import { BookOpen, HeadphonesIcon, Briefcase, Clock, Users, DollarSign, Star, Calendar } from 'lucide-react';
import { serviceService, adminService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const handleReserve = (svc) => {
    const qs = new URLSearchParams({
      subject: `Réservation service: ${svc?.name || ''}`,
      serviceId: String(svc?.id || ''),
      category: String(svc?.category || ''),
      serviceName: String(svc?.name || ''),
    }).toString();
    navigate(`/reservation?${qs}`);
  };

  const handleContact = () => {
    navigate('/contact');
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        // 1) Essai endpoint public
        try {
          const res = await serviceService.getAll(params);
          const payload = res?.data;
          const list = payload?.data?.services ?? payload?.services ?? payload?.data ?? payload ?? [];
          const items = Array.isArray(list) ? list : [];
          if (items.length > 0) {
            const normalized = items.map(s => ({
              id: s._id || s.id,
              name: typeof s.name === 'string' ? s.name : (s.name?.value || s.name?.title || '—'),
              category: s.category || 'formation',
              description: s.description || '',
              price: Number(s.price) || Number(s?.pricing?.basePrice) || 0,
              duration: s.duration || '—',
              maxParticipants: Number(s.maxParticipants) || 0,
              rating: Number(s.rating) || 0,
              reviews: Number(s.reviews || s.reviewCount) || 0,
              image: s.image || s.coverImage || '/images/placeholders/service.jpg',
              instructor: s.instructor || s.trainer || '—',
              nextSession: s.nextSession || s.nextDate || '—',
            }));
            setServices(normalized);
            return;
          }
        } catch (ePub) {
          // Passera en fallback admin ci-dessous
          console.debug('[Services] Public services indisponibles, tentative admin…', ePub?.response?.status);
        }

        // 2) Fallback: endpoint admin (nécessite auth)
        try {
          const resAdm = await adminService.services.getAll(params);
          const payload = resAdm?.data;
          const list = payload?.data?.services ?? payload?.services ?? payload?.data ?? payload ?? [];
          const items = Array.isArray(list) ? list : [];
          const normalized = items.map(s => ({
            id: s._id || s.id,
            name: typeof s.name === 'string' ? s.name : (s.name?.value || s.name?.title || '—'),
            category: s.category || 'formation',
            description: s.description || '',
            price: Number(s.price) || 0,
            duration: s.duration || '—',
            maxParticipants: Number(s.maxParticipants) || 0,
            rating: Number(s.rating) || 0,
            reviews: Number(s.reviews || s.reviewCount) || 0,
            image: s.image || s.coverImage || '/images/placeholders/service.jpg',
            instructor: s.instructor || s.trainer || '—',
            nextSession: s.nextSession || s.nextDate || '—',
          }));
          setServices(normalized);
        } catch (eAdm) {
          console.error('Erreur lors du chargement des services (admin fallback):', eAdm);
          setServices([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [selectedCategory]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'formation': return BookOpen;
      case 'assistance': return HeadphonesIcon;
      case 'conseil': return Briefcase;
      default: return BookOpen;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'formation': return 'bg-blue-100 text-blue-800';
      case 'assistance': return 'bg-green-100 text-green-800';
      case 'conseil': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredServices = services;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Chargement des services...</span>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !Array.isArray(filteredServices) || filteredServices.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Formations, assistance technique et conseils pour développer votre activité avicole
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tous les services
          </button>
          <button
            onClick={() => setSelectedCategory('formation')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedCategory === 'formation'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Formations
          </button>
          <button
            onClick={() => setSelectedCategory('assistance')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedCategory === 'assistance'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Assistance
          </button>
          <button
            onClick={() => setSelectedCategory('conseil')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedCategory === 'conseil'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Conseil
          </button>
        </div>

        {/* Grille des services */}
        {isEmpty ? (
          <div className="bg-white rounded-lg border p-12 text-center text-gray-600">
            Aucun service disponible pour le moment.
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => {
            const CategoryIcon = getCategoryIcon(service.category);
            return (
              <div key={service.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(service.category)}`}>
                      <CategoryIcon className="w-4 h-4 mr-1" />
                      {service.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">{service.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Durée: {service.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Max {service.maxParticipants} participants</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Prochaine session: {service.nextSession}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        {service.price.toLocaleString()} GNF
                      </span>
                      <p className="text-sm text-gray-500">par personne</p>
                    </div>
                    <button onClick={() => handleReserve(service)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Réserver
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Formateur: <span className="font-medium">{service.instructor}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {service.reviews} avis clients
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Section d'appel à l'action */}
        <div className="mt-16 bg-green-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Besoin d'un service personnalisé ?</h2>
          <p className="text-xl mb-6">
            Contactez-nous pour discuter de vos besoins spécifiques
          </p>
          <button onClick={handleContact} className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;
