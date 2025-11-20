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
import Layout from "./src/components/Layout.jsx";

// Contextes
import { AuthProvider, useAuth } from "./src/contexts/AuthContext.jsx";
import { CartProvider } from "./src/contexts/CartContext.jsx";
import { ToastProvider } from "./src/contexts/ToastContext.jsx";

// Composants communs
import ErrorBoundary from "./src/components/common/ErrorBoundary.jsx";

// Composants
import AdminRoute from "./src/components/AdminRoute.jsx";
import ProtectedRoute from "./src/components/ProtectedRoute.jsx";

// Pages publiques
import Cart from "./src/pages/Cart.jsx";
import Chat from "./src/pages/Chat.jsx";
import Checkout from "./src/pages/Checkout.jsx";
import Contact from "./src/pages/Contact.jsx";
import FAQ from "./src/pages/FAQ.jsx";
import FarmDetail from "./src/pages/FarmDetail.jsx";
import Farms from "./src/pages/Farms.jsx";
import ForgotPassword from "./src/pages/ForgotPassword.jsx";
import Forums from "./src/pages/Forums.jsx";
import ForumDetail from "./src/pages/ForumDetail.jsx";
import Help from "./src/pages/Help.jsx";
import Home from "./src/pages/Home.jsx";
import Login from "./src/pages/Login.jsx";
import NewForum from "./src/pages/NewForum.jsx";
import ProductDetail from "./src/pages/ProductDetail.jsx";
import Products from "./src/pages/Products.jsx";
import Profile from "./src/pages/Profile.jsx";
import RegisterEnhanced from "./src/pages/RegisterEnhanced.jsx";
import ResetPassword from "./src/pages/ResetPassword.jsx";
import Reviews from "./src/pages/Reviews.jsx";
import Services from "./src/pages/Services.jsx";
import Reservation from "./src/pages/Reservation.jsx";
import MesDemandes from "./src/pages/MesDemandes.jsx";
import DevisDetail from "./src/pages/DevisDetail.jsx";
import Terms from "./src/pages/Terms.jsx";

// Pages du tableau de bord
import Dashboard from "./src/pages/Dashboard.jsx";
import FarmManagement from "./src/pages/FarmManagement.jsx";
import ProductManagement from "./src/pages/ProductManagement.jsx";
import ClientDashboard from "./src/pages/client/ClientDashboard.jsx";

// Composants du tableau de bord
import AdminDashboard from "./src/components/admin/AdminDashboard.jsx";
import OrdersList from "./src/components/admin/orders/OrdersList.jsx";

// Utilitaires
import AuthTest from "./src/components/AuthTest.jsx";

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
