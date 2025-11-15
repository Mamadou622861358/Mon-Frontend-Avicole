import React from 'react';
import { Factory, Wrench, Settings, Gauge, Leaf } from 'lucide-react';

const IndustrialProjects = () => {
  const categories = [
    { icon: Factory, title: 'Couvoir', desc: 'Incubation, éclosion, contrôle climatique et traçabilité.' },
    { icon: Wrench, title: 'Abattoir', desc: 'Chaînes d’abattage conformes aux normes avec hygiène et sécurité.' },
    { icon: Settings, title: 'Reproducteurs', desc: 'Gestion de la fertilité, santé animale, performances.' },
    { icon: Gauge, title: 'Fabrication d’aliments', desc: 'Mélange, broyage, formulation et dosage automatisés.' },
    { icon: Leaf, title: 'Poules pondeuses', desc: 'Équipements de ponte, collecte d’œufs, éclairage et ventilation.' },
  ];

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Projets industriels</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Catalogue des solutions avicoles professionnelles (Soproda-like)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categories.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="border rounded-lg bg-white p-4 sm:p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center mb-2">
              <Icon className="w-5 h-5 text-green-600 mr-2"/>
              <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <p className="text-sm text-gray-600">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 sm:mt-8 p-4 border rounded-lg bg-green-50">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Besoin d’un devis personnalisé ?</h2>
        <p className="text-sm text-gray-700 mt-1">Décrivez votre projet et recevez une proposition adaptée.</p>
        <a href="/devis" className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Demander un devis</a>
      </div>
    </div>
  );
};

export default IndustrialProjects;
