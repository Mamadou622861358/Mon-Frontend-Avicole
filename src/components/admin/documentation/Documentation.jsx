import React, { useState } from 'react';
import { 
  Book, 
  Search, 
  ChevronRight, 
  ChevronDown,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  Bird,
  Truck,
  Star,
  Bell,
  Settings,
  BarChart3,
  FileText,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const Documentation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const documentationSections = [
    {
      id: 'getting-started',
      title: 'Démarrage Rapide',
      icon: <Book className="w-5 h-5" />,
      content: [
        {
          title: 'Connexion à l\'interface admin',
          description: 'Comment accéder et naviguer dans l\'interface d\'administration',
          steps: [
            'Connectez-vous avec un compte administrateur',
            'Accédez à /admin depuis votre navigateur',
            'Utilisez le menu latéral pour naviguer entre les sections',
            'Le tableau de bord affiche un aperçu général de votre plateforme'
          ]
        },
        {
          title: 'Navigation et interface',
          description: 'Comprendre l\'organisation de l\'interface admin',
          steps: [
            'Menu latéral : accès rapide à toutes les fonctionnalités',
            'Header : notifications et profil utilisateur',
            'Zone principale : contenu de la page active',
            'Footer : informations de copyright'
          ]
        }
      ]
    },
    {
      id: 'users-management',
      title: 'Gestion des Utilisateurs',
      icon: <Users className="w-5 h-5" />,
      content: [
        {
          title: 'Ajouter un utilisateur',
          description: 'Créer de nouveaux comptes utilisateur',
          steps: [
            'Cliquez sur "Nouvel Utilisateur" dans la page Utilisateurs',
            'Remplissez les informations requises (nom, email, rôle)',
            'Définissez le mot de passe initial',
            'Sélectionnez le rôle approprié (Client, Producteur, Admin)',
            'Cliquez sur "Ajouter" pour créer le compte'
          ]
        },
        {
          title: 'Modifier les rôles',
          description: 'Changer les permissions d\'un utilisateur',
          steps: [
            'Trouvez l\'utilisateur dans la liste',
            'Cliquez sur l\'icône d\'édition',
            'Modifiez le rôle dans le formulaire',
            'Sauvegardez les modifications'
          ]
        },
        {
          title: 'Suspendre un compte',
          description: 'Désactiver temporairement un utilisateur',
          steps: [
            'Sélectionnez l\'utilisateur à suspendre',
            'Changez le statut en "Suspendu"',
            'L\'utilisateur ne pourra plus se connecter'
          ]
        }
      ]
    },
    {
      id: 'products-management',
      title: 'Gestion des Produits',
      icon: <Package className="w-5 h-5" />,
      content: [
        {
          title: 'Ajouter un produit',
          description: 'Créer une nouvelle fiche produit',
          steps: [
            'Cliquez sur "Nouveau Produit"',
            'Remplissez les informations de base (nom, description, prix)',
            'Sélectionnez la catégorie appropriée',
            'Ajoutez une image du produit',
            'Définissez le stock initial et le stock minimum',
            'Configurez les promotions si nécessaire'
          ]
        },
        {
          title: 'Gestion des stocks',
          description: 'Suivre et mettre à jour les inventaires',
          steps: [
            'Consultez les alertes de stock faible sur le tableau de bord',
            'Modifiez les quantités depuis la page Produits',
            'Configurez des alertes automatiques',
            'Exportez les rapports de stock'
          ]
        },
        {
          title: 'Promotions et réductions',
          description: 'Créer des offres spéciales',
          steps: [
            'Éditez un produit existant',
            'Définissez un prix promotionnel',
            'Configurez les dates de début et fin',
            'La promotion s\'appliquera automatiquement'
          ]
        }
      ]
    },
    {
      id: 'orders-management',
      title: 'Gestion des Commandes',
      icon: <ShoppingCart className="w-5 h-5" />,
      content: [
        {
          title: 'Traitement des commandes',
          description: 'Gérer le cycle de vie des commandes',
          steps: [
            'Consultez les nouvelles commandes sur le tableau de bord',
            'Vérifiez les détails de chaque commande',
            'Changez le statut selon l\'avancement',
            'Assignez les commandes aux livreurs'
          ]
        },
        {
          title: 'Suivi des livraisons',
          description: 'Organiser et suivre les livraisons',
          steps: [
            'Accédez à la section Livraisons',
            'Assignez un livreur à chaque commande',
            'Suivez le statut en temps réel',
            'Notifiez les clients des mises à jour'
          ]
        }
      ]
    },
    {
      id: 'forums-management',
      title: 'Modération des Forums',
      icon: <MessageSquare className="w-5 h-5" />,
      content: [
        {
          title: 'Modérer les discussions',
          description: 'Gérer le contenu des forums',
          steps: [
            'Consultez les nouveaux posts dans la section Forums',
            'Approuvez ou rejetez le contenu',
            'Modifiez les catégories et tags',
            'Supprimez le contenu inapproprié'
          ]
        },
        {
          title: 'Créer des annonces',
          description: 'Publier des informations importantes',
          steps: [
            'Cliquez sur "Nouveau Forum"',
            'Rédigez votre annonce',
            'Sélectionnez la catégorie "Annonces"',
            'Publiez pour tous les utilisateurs'
          ]
        }
      ]
    },
    {
      id: 'animals-management',
      title: 'Suivi des Animaux',
      icon: <Bird className="w-5 h-5" />,
      content: [
        {
          title: 'Enregistrer de nouveaux animaux',
          description: 'Ajouter des animaux au système',
          steps: [
            'Cliquez sur "Nouvel Animal"',
            'Sélectionnez le type (poussins, poules, coqs, etc.)',
            'Renseignez la race, l\'âge et le poids',
            'Associez à une ferme',
            'Définissez le régime alimentaire'
          ]
        },
        {
          title: 'Suivi de la santé',
          description: 'Monitorer l\'état de santé du cheptel',
          steps: [
            'Consultez les fiches individuelles',
            'Mettez à jour l\'état de santé',
            'Enregistrez les traitements vétérinaires',
            'Suivez la croissance et la production'
          ]
        }
      ]
    },
    {
      id: 'notifications-system',
      title: 'Système de Notifications',
      icon: <Bell className="w-5 h-5" />,
      content: [
        {
          title: 'Envoyer des notifications',
          description: 'Communiquer avec les utilisateurs',
          steps: [
            'Accédez à la section Notifications',
            'Cliquez sur "Nouvelle Notification"',
            'Rédigez votre message',
            'Sélectionnez les destinataires (tous, clients, producteurs)',
            'Programmez l\'envoi ou envoyez immédiatement'
          ]
        },
        {
          title: 'Types de notifications',
          description: 'Utiliser les différents types de messages',
          steps: [
            'Information : messages généraux',
            'Alerte : messages urgents',
            'Succès : confirmations positives',
            'Promotion : offres commerciales'
          ]
        }
      ]
    },
    {
      id: 'reviews-management',
      title: 'Gestion des Avis',
      icon: <Star className="w-5 h-5" />,
      content: [
        {
          title: 'Modérer les avis clients',
          description: 'Valider et gérer les commentaires',
          steps: [
            'Consultez les avis en attente de modération',
            'Lisez le contenu et vérifiez les photos',
            'Approuvez les avis conformes',
            'Rejetez ou supprimez le contenu inapproprié'
          ]
        }
      ]
    },
    {
      id: 'reports-analytics',
      title: 'Rapports et Analyses',
      icon: <BarChart3 className="w-5 h-5" />,
      content: [
        {
          title: 'Générer des rapports',
          description: 'Créer des analyses de performance',
          steps: [
            'Sélectionnez la période d\'analyse',
            'Choisissez le type de rapport (ventes, utilisateurs, etc.)',
            'Consultez les graphiques et statistiques',
            'Exportez en PDF ou Excel'
          ]
        }
      ]
    },
    {
      id: 'settings-config',
      title: 'Configuration Système',
      icon: <Settings className="w-5 h-5" />,
      content: [
        {
          title: 'Paramètres généraux',
          description: 'Configurer les informations du site',
          steps: [
            'Modifiez le nom et la description du site',
            'Uploadez le logo et favicon',
            'Configurez les informations de contact',
            'Gérez les liens des réseaux sociaux'
          ]
        }
      ]
    }
  ];

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.some(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Documentation Admin</h1>
        <p className="text-gray-600">Guide complet pour utiliser l'interface d'administration GuinéeAvicole</p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher dans la documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Liens rapides */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Accès Rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { icon: <Users className="w-5 h-5" />, label: 'Utilisateurs', href: '#users-management' },
            { icon: <Package className="w-5 h-5" />, label: 'Produits', href: '#products-management' },
            { icon: <ShoppingCart className="w-5 h-5" />, label: 'Commandes', href: '#orders-management' },
            { icon: <MessageSquare className="w-5 h-5" />, label: 'Forums', href: '#forums-management' },
            { icon: <Bird className="w-5 h-5" />, label: 'Animaux', href: '#animals-management' },
            { icon: <Bell className="w-5 h-5" />, label: 'Notifications', href: '#notifications-system' }
          ].map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-blue-600 mb-2">{item.icon}</div>
              <span className="text-sm font-medium text-gray-900">{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Sections de documentation */}
      <div className="space-y-4">
        {filteredSections.map((section) => (
          <div key={section.id} className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="text-blue-600 mr-3">{section.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              </div>
              {expandedSections[section.id] ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {expandedSections[section.id] && (
              <div className="px-4 pb-4">
                <div className="border-t border-gray-200 pt-4">
                  {section.content.map((item, index) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <h4 className="text-md font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Étapes :</h5>
                        <ol className="list-decimal list-inside space-y-1">
                          {item.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-sm text-gray-700">{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Section d'aide supplémentaire */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Besoin d'aide supplémentaire ?</h3>
            <p className="text-blue-800 mb-4">
              Si vous ne trouvez pas la réponse à votre question dans cette documentation, 
              n'hésitez pas à contacter notre équipe de support.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:support@guineeavicole.com"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Contacter le Support
              </a>
              <a
                href="/admin/settings"
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Paramètres Système
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ rapide */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions Fréquentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              question: "Comment réinitialiser le mot de passe d'un utilisateur ?",
              answer: "Éditez l'utilisateur et définissez un nouveau mot de passe temporaire. L'utilisateur devra le changer à sa prochaine connexion."
            },
            {
              question: "Que faire si un produit n'apparaît pas sur le site ?",
              answer: "Vérifiez que le produit est bien en statut 'Actif' et qu'il a un stock supérieur à 0."
            },
            {
              question: "Comment configurer les notifications automatiques ?",
              answer: "Utilisez la section Notifications pour créer des messages programmés selon vos besoins."
            },
            {
              question: "Comment exporter les données de vente ?",
              answer: "Rendez-vous dans la section Rapports, sélectionnez la période et cliquez sur 'Exporter'."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
              <p className="text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Documentation;
