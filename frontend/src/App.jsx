import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Footer from "./components/Footer";
import Header from "./components/Header";
import AdminHeader from "./components/Admin/AdminHeader";

import ProtectedRoute from "./components/Utils/ProtectedRoute.jsx";
import Admin from "./components/Utils/AdminProtectedRoute.jsx";

import Home from "./pages/User/Home.jsx";
import Pantry from "./pages/User/Pantry.jsx";
import RecipePage from "./pages/User/RecipePage.jsx";
import RecipeDetail from "./components/Users/RecipeDetail.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import IngredientDatabase from "./pages/Admin/IngredientsDatabase.jsx";
import EditRecipe from "./pages/Admin/EditRecipe.jsx";
import ManageRecipes from "./pages/Admin/ManageRecipes.jsx";
import PendingRecipeEditPage from "./pages/User/PendingRecipeEditPage.jsx";
import Suggestions from "./pages/User/RecipeSuggestions.jsx";

const AppContent = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  // Define routes where you want to exclude Header and Footer
  const excludeHeaderFooterRoutes = ["/login", "/register"];

  // Check if the current path starts with /admin
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Determine if header/footer should be shown
  const shouldShowHeaderFooter =
    !excludeHeaderFooterRoutes.includes(location.pathname) &&
    (!isAdminRoute || (isAdminRoute && location.pathname === "/admin"));

  return (
    <>
      {/* Show AdminHeader for admin routes if user is admin, otherwise show regular Header */}
      {shouldShowHeaderFooter &&
        (isAdminRoute && user && isAdmin() ? <AdminHeader /> : <Header />)}

      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/recipes" element={<RecipePage />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/suggestions" element={<Suggestions />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <Admin>
                <AdminDashboard />
              </Admin>
            }
          />
          <Route
            path="/admin/recipes"
            element={
              <Admin>
                <ManageRecipes />
              </Admin>
            }
          />
          <Route
            path="/admin/ingredients"
            element={
              <Admin>
                <IngredientDatabase />
              </Admin>
            }
          />
          <Route
            path="/admin/recipes/add"
            element={
              <Admin>
                <EditRecipe />
              </Admin>
            }
          />
          <Route
            path="/admin/recipes/edit/:id"
            element={
              <Admin>
                <EditRecipe />
              </Admin>
            }
          />

          {/* User Recipe Routes */}
          <Route path="/recipes/add" element={<PendingRecipeEditPage />} />

          <Route
            path="*"
            element={
              <h2 className="text-center mt-20 text-red-500">
                404 - Page Not Found
              </h2>
            }
          />
        </Routes>
      </main>

      {shouldShowHeaderFooter && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
