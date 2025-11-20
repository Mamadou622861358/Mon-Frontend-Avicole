import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import api from "../../services/api";

// Création du contexte
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

// Composant fournisseur du contexte
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          console.log('Token trouvé, vérification du profil utilisateur...');
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          
          // Vérifier d'abord si le token est valide
          try {
            const response = await api.get("/auth/me");
            if (response.data && (response.data.user || response.data.data)) {
              const userData = response.data.user || response.data.data || response.data;
              console.log('Utilisateur connecté:', userData.email || userData.id);
              if (isMounted) {
                setUser(userData);
              }
            } else {
              console.log('Aucun utilisateur trouvé dans la réponse');
              // Ne pas lever d'erreur, simplement nettoyer le token invalide
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              delete api.defaults.headers.common["Authorization"];
            }
          } catch (profileError) {
            console.error('Erreur lors de la récupération du profil:', profileError);
            // Si l'erreur est 401, essayer de rafraîchir le token
            if (profileError.response && profileError.response.status === 401) {
              console.log('Token expiré, tentative de rafraîchissement...');
              const refreshToken = localStorage.getItem("refreshToken");
              if (refreshToken) {
                try {
                  const refreshResponse = await api.post("/auth/refresh-token", { refreshToken });
                  const { accessToken } = refreshResponse.data;
                  localStorage.setItem("accessToken", accessToken);
                  api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
                  
                  // Réessayer de récupérer le profil
                  const retryResponse = await api.get("/auth/me");
                  if (retryResponse.data && retryResponse.data.user) {
                    if (isMounted) {
                      setUser(retryResponse.data.user);
                    }
                    return;
                  }
                } catch (refreshError) {
                  console.error('Échec du rafraîchissement du token:', refreshError);
                  // Nettoyer les tokens en cas d'échec
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  delete api.defaults.headers.common["Authorization"];
                  if (isMounted) {
                    setUser(null);
                  }
                }
              }
            }
          }
        } else {
          console.log('Aucun token trouvé, utilisateur non connecté');
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Erreur d'initialisation de l'authentification:", error);
        // Nettoyer les tokens en cas d'erreur
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        delete api.defaults.headers.common["Authorization"];
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Inscription
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);

      const { user, accessToken, refreshToken } = response.data.data;

      // Stocker les tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Configurer l'API
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      setUser(user);

      return { success: true, user };
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur lors de l'inscription";
      setError(message);
      throw new Error(message);
    }
  };

  // Connexion
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      
      if (!response) {
        throw new Error('Réponse du serveur invalide');
      }

      // Vérifier que la réponse contient les données attendues
      if (!response.success || !response.token || !response.user) {
        throw new Error('Réponse du serveur incomplète');
      }

      // Extraire les données de la réponse
      const { token, refreshToken, user: userData } = response;

      // Stocker les tokens
      localStorage.setItem("accessToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Configurer l'en-tête d'autorisation pour les requêtes futures
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Mettre à jour l'état de l'utilisateur
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Nettoyer en cas d'erreur
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      
      // Gestion des erreurs
      let message = "Erreur lors de la connexion";
      if (error.response) {
        message = error.response.data?.message || message;
      } else if (error.request) {
        message = "Impossible de se connecter au serveur";
      } else {
        message = error.message || message;
      }
      
      setError(message);
      throw new Error(message);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Nettoyer le stockage et l'état
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      navigate("/");
    }
  };

  // Rafraîchir le token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Aucun refresh token disponible");
      }

      const response = await api.post("/auth/refresh-token", { refreshToken });
      const { accessToken } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      return accessToken;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      logout();
      throw error;
    }
  };

  // Mettre à jour le profil
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData);
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la mise à jour du profil";
      setError(message);
      throw new Error(message);
    }
  };

  // Mémoïser la valeur du contexte pour éviter des re-rendus inutiles
  const contextValue = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      register,
      logout,
      refreshToken,
      updateProfile,
      isAuthenticated: !!user,
      isProducteur: user?.role === "producteur",
      isAdmin: user?.role === "admin",
    }),
    [user, loading, error]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Exporter le contexte par défaut pour les cas où il est nécessaire
export default AuthContext;
