import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, Store, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
// Remplacement des graphiques par des éléments HTML natifs
const BarChart = ({ title, data }) => (
  <div style={{ height: '300px', border: '1px solid #f0f0f0', padding: '16px', borderRadius: '8px' }}>
    <h3>{title}</h3>
    <div style={{ display: 'flex', height: '250px', alignItems: 'flex-end', gap: '10px', marginTop: '20px' }}>
      {data.labels.map((label, index) => (
        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div 
            style={{
              width: '30px',
              height: `${data.datasets[0].data[index] * 2}px`,
              backgroundColor: '#1890ff',
              margin: '0 auto',
            }}
            title={`${label}: ${data.datasets[0].data[index]}`}
          />
          <div style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center' }}>{label}</div>
        </div>
      ))}
    </div>
  </div>
);

const PieChart = ({ title, data }) => {
  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
  
  return (
    <div style={{ height: '300px', border: '1px solid #f0f0f0', padding: '16px', borderRadius: '8px' }}>
      <h3>{title}</h3>
      <div style={{ display: 'flex', marginTop: '20px' }}>
        <div style={{ width: '200px', height: '200px', position: 'relative' }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {data.datasets[0].data.reduce((acc, value, i) => {
              const prev = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
              const angle = (value / total) * 360;
              const largeArcFlag = angle <= 180 ? 0 : 1;
              const x1 = 50 + 50 * Math.cos((prev * Math.PI) / 180);
              const y1 = 50 + 50 * Math.sin((prev * Math.PI) / 180);
              const x2 = 50 + 50 * Math.cos(((prev + angle) * Math.PI) / 180);
              const y2 = 50 + 50 * Math.sin(((prev + angle) * Math.PI) / 180);
              
              const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              const color = `hsl(${(i * 360) / data.labels.length}, 70%, 60%)`;
              
              acc.push({
                path,
                color,
                label: data.labels[i],
                value,
                percentage: ((value / total) * 100).toFixed(1) + '%',
                endAngle: prev + angle
              });
              
              return acc;
            }, []).map((item, i) => (
              <g key={i}>
                <path d={item.path} fill={item.color} stroke="#fff" strokeWidth="0.5" />
              </g>
            ))}
          </svg>
        </div>
        <div style={{ marginLeft: '20px' }}>
          {data.labels.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: `hsl(${(i * 360) / data.labels.length}, 70%, 60%)`, marginRight: '8px' }}></div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// Données factices pour les graphiques (à remplacer par des appels API)
const salesData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  datasets: [
    {
      label: 'Ventes 2023',
      data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 80],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};

const userData = {
  labels: ['Clients', 'Administrateurs', 'Modérateurs'],
  datasets: [
    {
      data: [300, 5, 10],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(75, 192, 192, 0.7)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const stats = [
  {
    title: 'Utilisateurs totaux',
    value: '1,234',
    icon: <Users className="w-6 h-6" />,
    change: 12.5,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    title: 'Commandes ce mois-ci',
    value: '245',
    icon: <ShoppingCart className="w-6 h-6" />,
    change: 8.2,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    title: 'Revenus totaux',
    value: '12,540 GNF',
    icon: <DollarSign className="w-6 h-6" />,
    change: -2.3,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    title: 'Fermes actives',
    value: '42',
    icon: <Store className="w-6 h-6" />,
    change: 5.6,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
];

const DashboardStats = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  {stat.change > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(stat.change)}% {stat.change >= 0 ? 'de plus' : 'de moins'}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={stat.textColor}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique des ventes */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <BarChart title="Ventes mensuelles" data={salesData} />
        </div>

        {/* Graphique des utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <PieChart title="Répartition des utilisateurs" data={userData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objectifs */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectifs du mois</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ventes mensuelles</span>
                <span className="text-sm font-bold text-gray-900">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Nouveaux clients</span>
                <span className="text-sm font-bold text-gray-900">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '45%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Croissance des revenus</span>
                <span className="text-sm font-bold text-gray-900">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dernières activités */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernières activités</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nouvelle commande #{1000 + item}</p>
                  <p className="text-sm text-gray-500">
                    Commande passée par John Doe
                  </p>
                  <p className="text-xs text-gray-400">
                    Il y a {item * 2} heures
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
