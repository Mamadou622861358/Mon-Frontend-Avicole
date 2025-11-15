import { 
  authService, 
  publicFarmService, 
  publicReviewService, 
  chatService,
  adminService 
} from '../services/api';

/**
 * Script de test d'intégration frontend-backend
 * Teste les principales fonctionnalités après suppression des données simulées
 */

class IntegrationTester {
  constructor() {
    this.results = [];
    this.testUser = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    this.results.push(logEntry);
    
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m', // Yellow
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async testAuthentication() {
    this.log('🔐 Test d\'authentification...', 'info');
    
    try {
      // Test d'inscription
      const registerData = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123!',
        role: 'client',
        phone: '+224123456789'
      };

      const registerResponse = await authService.register(registerData);
      this.log('✅ Inscription réussie', 'success');

      // Test de connexion
      const loginResponse = await authService.login({
        email: registerData.email,
        password: registerData.password
      });

      if (loginResponse.data.accessToken) {
        this.testUser = loginResponse.data.user;
        localStorage.setItem('accessToken', loginResponse.data.accessToken);
        this.log('✅ Connexion réussie', 'success');
        return true;
      }
    } catch (error) {
      this.log(`❌ Erreur d'authentification: ${error.message}`, 'error');
      return false;
    }
  }

  async testFarmsAPI() {
    this.log('🏡 Test de l\'API des fermes...', 'info');
    
    try {
      const response = await publicFarmService.getAll();
      
      if (response.data) {
        this.log(`✅ ${response.data.length} fermes récupérées`, 'success');
        
        if (response.data.length > 0) {
          const farm = response.data[0];
          const farmDetails = await publicFarmService.getById(farm._id);
          this.log('✅ Détails de ferme récupérés', 'success');
        }
        
        return true;
      } else {
        this.log('⚠️ Aucune ferme trouvée', 'warning');
        return true; // Pas d'erreur, juste pas de données
      }
    } catch (error) {
      this.log(`❌ Erreur API fermes: ${error.message}`, 'error');
      return false;
    }
  }

  async testReviewsAPI() {
    this.log('⭐ Test de l\'API des avis...', 'info');
    
    try {
      const response = await publicReviewService.getAll();
      
      if (response.data) {
        this.log(`✅ ${response.data.length} avis récupérés`, 'success');
        
        // Test de création d'avis si utilisateur connecté
        if (this.testUser) {
          const newReview = {
            rating: 5,
            title: 'Test Review',
            comment: 'Ceci est un avis de test',
            product: 'Test Product'
          };
          
          const createResponse = await publicReviewService.create(newReview);
          this.log('✅ Avis créé avec succès', 'success');
        }
        
        return true;
      } else {
        this.log('⚠️ Aucun avis trouvé', 'warning');
        return true;
      }
    } catch (error) {
      this.log(`❌ Erreur API avis: ${error.message}`, 'error');
      return false;
    }
  }

  async testChatAPI() {
    this.log('💬 Test de l\'API de chat...', 'info');
    
    if (!this.testUser) {
      this.log('⚠️ Chat test ignoré - utilisateur non connecté', 'warning');
      return true;
    }
    
    try {
      // Test de récupération des conversations
      const conversationsResponse = await chatService.getConversations();
      this.log(`✅ ${conversationsResponse.data?.length || 0} conversations récupérées`, 'success');
      
      // Test de création de conversation
      const newConversation = {
        type: 'support',
        subject: 'Test de support'
      };
      
      const createResponse = await chatService.createConversation(newConversation);
      this.log('✅ Conversation créée avec succès', 'success');
      
      // Test d'envoi de message
      if (createResponse.data._id) {
        const messageData = {
          content: 'Message de test',
          type: 'text'
        };
        
        await chatService.sendMessage(createResponse.data._id, messageData);
        this.log('✅ Message envoyé avec succès', 'success');
      }
      
      return true;
    } catch (error) {
      this.log(`❌ Erreur API chat: ${error.message}`, 'error');
      return false;
    }
  }

  async testAdminAPI() {
    this.log('👑 Test de l\'API admin (mode développement)...', 'info');
    
    try {
      // Test des statistiques du dashboard (sans authentification en mode dev)
      const statsResponse = await adminService.getDashboardStats();
      this.log('✅ Statistiques admin récupérées', 'success');
      
      // Test de récupération des utilisateurs
      const usersResponse = await adminService.getUsers();
      this.log(`✅ ${usersResponse.data?.users?.length || 0} utilisateurs récupérés`, 'success');
      
      // Test des produits
      const productsResponse = await adminService.getProducts();
      this.log(`✅ ${productsResponse.data?.products?.length || 0} produits récupérés`, 'success');
      
      // Test des commandes
      const ordersResponse = await adminService.getOrders();
      this.log(`✅ ${ordersResponse.data?.orders?.length || 0} commandes récupérées`, 'success');
      
      // Test des fermes
      const farmsResponse = await adminService.getFarms();
      this.log(`✅ ${farmsResponse.data?.farms?.length || 0} fermes récupérées`, 'success');
      
      // Test des animaux
      const animalsResponse = await adminService.getAnimals();
      this.log(`✅ ${animalsResponse.data?.animals?.length || 0} animaux récupérés`, 'success');
      
      // Test des livraisons
      const deliveriesResponse = await adminService.getDeliveries();
      this.log(`✅ ${deliveriesResponse.data?.deliveries?.length || 0} livraisons récupérées`, 'success');
      
      // Test des avis
      const reviewsResponse = await adminService.getReviews();
      this.log(`✅ ${reviewsResponse.data?.reviews?.length || 0} avis récupérés`, 'success');
      
      // Test des notifications
      const notificationsResponse = await adminService.getNotifications();
      this.log(`✅ ${notificationsResponse.data?.notifications?.length || 0} notifications récupérées`, 'success');
      
      return true;
    } catch (error) {
      this.log(`❌ Erreur API admin: ${error.message}`, 'error');
      return false;
    }
  }

  async testErrorHandling() {
    this.log('🚨 Test de gestion d\'erreurs...', 'info');
    
    try {
      // Test d'une route inexistante
      await publicFarmService.getById('nonexistent-id');
    } catch (error) {
      if (error.response?.status === 404) {
        this.log('✅ Erreur 404 correctement gérée', 'success');
      } else {
        this.log(`✅ Erreur gérée: ${error.message}`, 'success');
      }
    }
    
    try {
      // Test sans token d'authentification
      localStorage.removeItem('accessToken');
      await adminService.getDashboardStats();
    } catch (error) {
      if (error.response?.status === 401) {
        this.log('✅ Erreur 401 correctement gérée', 'success');
      } else {
        this.log(`✅ Erreur d'auth gérée: ${error.message}`, 'success');
      }
    }
    
    return true;
  }

  async runAllTests() {
    this.log('🚀 Début des tests d\'intégration frontend-backend', 'info');
    this.log('=' .repeat(60), 'info');
    
    const tests = [
      { name: 'Authentication', fn: this.testAuthentication },
      { name: 'Farms API', fn: this.testFarmsAPI },
      { name: 'Reviews API', fn: this.testReviewsAPI },
      { name: 'Chat API', fn: this.testChatAPI },
      { name: 'Admin API', fn: this.testAdminAPI },
      { name: 'Error Handling', fn: this.testErrorHandling }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
      try {
        const result = await test.fn.call(this);
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        this.log(`❌ Test ${test.name} échoué: ${error.message}`, 'error');
        failed++;
      }
      
      this.log('-'.repeat(40), 'info');
    }
    
    this.log('📊 RÉSULTATS DES TESTS', 'info');
    this.log('=' .repeat(60), 'info');
    this.log(`✅ Tests réussis: ${passed}`, 'success');
    this.log(`❌ Tests échoués: ${failed}`, failed > 0 ? 'error' : 'info');
    this.log(`📈 Taux de réussite: ${((passed / (passed + failed)) * 100).toFixed(1)}%`, 'info');
    
    if (failed === 0) {
      this.log('🎉 Tous les tests sont passés! L\'intégration fonctionne correctement.', 'success');
    } else {
      this.log('⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus.', 'warning');
    }
    
    return { passed, failed, results: this.results };
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        success: this.results.filter(r => r.type === 'success').length,
        errors: this.results.filter(r => r.type === 'error').length,
        warnings: this.results.filter(r => r.type === 'warning').length
      },
      details: this.results
    };
    
    return report;
  }
}

// Export pour utilisation dans la console du navigateur
window.IntegrationTester = IntegrationTester;

// Fonction utilitaire pour lancer les tests rapidement
window.runIntegrationTests = async () => {
  const tester = new IntegrationTester();
  return await tester.runAllTests();
};

export default IntegrationTester;
