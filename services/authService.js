import axios from 'axios';

const API_URL = 'http://localhost:5002/api/v1/auth';

const authService = {
  register: async (userData) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (key === 'photo' && userData[key]) {
          formData.append(key, userData[key], userData[key].name);
        } else if (key !== 'confirmPassword') { // Ne pas envoyer confirmPassword
          formData.append(key, userData[key]);
        }
      });
  
      const response = await axios.post(`${API_URL}/register`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
  
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error; // Propager l'erreur pour la gérer dans le composant
    }
  },

  // Connexion utilisateur
  login: async (email, password) => {
    try {
      // Créer un objet avec les données de connexion
      const loginData = { 
        email: email.trim(),
        password: password
      };

      console.log('Envoi de la requête de connexion vers:', `${API_URL}/login`);
      console.log('Données envoyées:', loginData);
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });
      
      // Vérifier si la réponse est au format JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Réponse non-JSON reçue:', text);
        throw new Error('Format de réponse inattendu du serveur');
      }
      
      const data = await response.json();
      console.log('Réponse du serveur:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Échec de la connexion');
      }
      
      // Vérifier que les données nécessaires sont présentes
      if (!data.success) {
        throw new Error(data.message || 'Échec de la connexion');
      }
      
      // Stocker les informations de l'utilisateur
      if (data.token) {
        localStorage.setItem('accessToken', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } else {
        console.warn('Aucun token reçu dans la réponse');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('user');
  },

  // Mise à jour du profil
  updateProfile: async (userData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    
    Object.keys(userData).forEach(key => {
      if (key === 'photo' && userData[key]) {
        formData.append(key, userData[key], userData[key].name);
      } else if (userData[key]) {
        formData.append(key, userData[key]);
      }
    });

    const response = await axios.put(`${API_URL}/profile`, formData, {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    const updatedUser = { ...user, user: response.data.user };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return response.data;
  },

  // Récupérer l'utilisateur courant
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const user = localStorage.getItem('user');
    return !!user;
  },

  // Vérifier si l'utilisateur est admin
  isAdmin: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.user?.role === 'admin';
  }
};

export default authService;

// Ajouter après la définition de API_URL
axios.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);