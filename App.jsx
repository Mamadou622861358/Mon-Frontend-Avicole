import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  Navigate,
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

// Configuration de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Composants
// Layouts
import Layout from "./components/Layout";

// Contextes
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ToastProvider } from "./contexts/ToastContext";

// Composants communs
import ErrorBoundary from "./components/common/ErrorBoundary";

// Composants
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages publiques
import Cart from "./pages/Cart";
import Chat from "./pages/Chat";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import FarmDetail from "./pages/FarmDetail";
import Farms from "./pages/Farms";
import ForgotPassword from "./pages/ForgotPassword";
import Forums from "./pages/Forums";
import ForumDetail from "./pages/ForumDetail";
import Help from "./pages/Help";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NewForum from "./pages/NewForum";
import ProductDetail from "./pages/ProductDetail";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import RegisterEnhanced from "./pages/RegisterEnhanced";
import ResetPassword from "./pages/ResetPassword";
import Reviews from "./pages/Reviews";
import Services from "./pages/Services";
import Reservation from "./pages/Reservation";
import MesDemandes from "./pages/MesDemandes";
import DevisDetail from "./pages/DevisDetail";
import Terms from "./pages/Terms";

// Pages du tableau de bord
import Dashboard from "./pages/Dashboard";
import FarmManagement from "./pages/FarmManagement";
import ProductManagement from "./pages/ProductManagement";
import ClientDashboard from "./pages/client/ClientDashboard";

// Composants du tableau de bord
import AdminDashboard from "./components/admin/AdminDashboard";
import OrdersList from "./components/admin/orders/OrdersList";

// Utilitaires
import AuthTest from "./components/AuthTest";

// Composant pour vérifier les rôles
const RoleBasedRoute = ({ element, requiredRoles }) => {
  const { user } = useAuth();

  // Si aucun rôle requis, on laisse passer
  if (!requiredRoles || requiredRoles.length === 0) {
    return element;
  }

  // Vérifier si l'utilisateur a l'un des rôles requis
  const hasRequiredRole = user && requiredRoles.includes(user.role);

  if (!hasRequiredRole) {
    // Rediriger vers la page d'accueil ou une page d'erreur 403
    return <Navigate to="/" replace />;
  }

  return element;
};

// Composant pour les routes protégées
const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
};

// Composant pour les routes administrateur avec système modulaire professionnel
const AdminRoutes = () => {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
};

const protectedRoutes = [
  // Routes pour les administrateurs et producteurs
  {
    path: "/dashboard",
    element: <Dashboard />,
    roles: ["admin", "farmer", "producteur"],
  },
  {
    path: "/mes-fermes",
    element: <FarmManagement />,
    roles: ["admin", "farmer", "producteur"],
  },
  {
    path: "/mes-produits",
    element: <ProductManagement />,
    roles: ["admin", "farmer", "producteur"],
  },
  {
    path: "/mes-commandes",
    element: <OrdersList />,
    roles: ["admin", "client", "farmer", "producteur"],
  },
  {
    path: "/commande/:id",
    element: <OrdersList />,
    roles: ["admin", "client", "farmer", "producteur"],
  },
  {
    path: "/nouvelle-ferme",
    element: <FarmManagement />,
    roles: ["admin", "farmer", "producteur"],
  },
  {
    path: "/ferme/editer/:id",
    element: <FarmManagement />,
    roles: ["admin", "farmer", "producteur"],
  },
  {
    path: "/produit/editer/:id",
    element: <ProductManagement />,
    roles: ["admin", "farmer", "producteur"],
  },
  {
    path: "/nouveau-produit",
    element: <ProductManagement />,
    roles: ["admin", "farmer", "producteur"],
  },
  {
    path: "/profile",
    element: <Profile />,
    roles: ["admin", "client", "farmer", "producteur"],
  },
  {
    path: "/parametres",
    element: <Dashboard />,
    roles: ["admin", "client", "farmer", "producteur"],
  },
  {
    path: "/nouveau-forum",
    element: <NewForum />,
    roles: ["admin", "client", "farmer", "producteur"],
  },
  {
    path: "/forums/editer/:id",
    element: <NewForum />,
    roles: ["admin", "client", "farmer", "producteur"],
  },
  // Routes spécifiques aux clients
  {
    path: "/mon-compte",
    element: <ClientDashboard />,
    roles: ["client"],
  },
  {
    path: "/mes-favoris",
    element: <div>Mes Favoris (à implémenter)</div>,
    roles: ["client"],
  },
  {
    path: "/historique-commandes",
    element: <OrdersList />,
    roles: ["client"],
  },
];

const AppContent = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Routes>
            {/* Routes publiques */}
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/login"
              element={
                <Layout>
                  <Login />
                </Layout>
              }
            />
            <Route
              path="/register"
              element={
                <Layout>
                  <RegisterEnhanced />
                </Layout>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <Layout>
                  <ForgotPassword />
                </Layout>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <Layout>
                  <ResetPassword />
                </Layout>
              }
            />
            <Route
              path="/products"
              element={
                <Layout>
                  <Products />
                </Layout>
              }
            />
            <Route
              path="/products/:id"
              element={
                <Layout>
                  <ProductDetail />
                </Layout>
              }
            />
            <Route
              path="/cart"
              element={
                <Layout>
                  <Cart />
                </Layout>
              }
            />
            <Route
              path="/checkout"
              element={
                <Layout>
                  <Checkout />
                </Layout>
              }
            />
            <Route
              path="/help"
              element={
                <Layout>
                  <Help />
                </Layout>
              }
            />
            <Route
              path="/contact"
              element={
                <Layout>
                  <Contact />
                </Layout>
              }
            />
            {/* Routes protégées - Services et Communauté */}
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Services />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservation"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reservation />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mes-demandes"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MesDemandes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/devis/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DevisDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/fermes"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Farms />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/fermes/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FarmDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/avis"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reviews />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Chat />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/forums"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Forums />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/forums/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ForumDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/forums/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NewForum />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/faq"
              element={
                <Layout>
                  <FAQ />
                </Layout>
              }
            />
            <Route
              path="/terms"
              element={
                <Layout>
                  <Terms />
                </Layout>
              }
            />
            <Route path="/test-auth" element={<AuthTest />} />

            {/* Routes protégées avec gestion des rôles */}
            <Route element={<ProtectedLayout />}>
              {protectedRoutes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <RoleBasedRoute
                      element={route.element}
                      requiredRoles={route.roles}
                    />
                  }
                />
              ))}
            </Route>

            {/* Routes administrateur */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Redirection pour les routes inconnues */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
