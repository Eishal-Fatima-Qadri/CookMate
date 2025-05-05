import React from 'react';
import {Route, Routes, useLocation} from 'react-router-dom'; // Import useLocation
import {AuthProvider} from './context/AuthContext'; // Adjust the path if needed
import Home from './pages/User/Home.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';
import Header from './components/Header';
import Pantry from './pages/User/Pantry.jsx';
import ProtectedRoute from './components/Utils/ProtectedRoute.jsx';
import RecipePage from './pages/User/RecipePage.jsx';
import RecipeDetail from './components/Users/RecipeDetail.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AdminProtectedRoute from './components/Utils/AdminProtectedRoute.jsx';
import ManageRecipes from "./pages/Admin/ManageRecipes.jsx";
import IngredientDatabase from "./pages/Admin/IngredientsDatabase.jsx";
import EditRecipe from "./pages/Admin/EditRecipe.jsx";
import PendingRecipeEditPage from "./pages/User/PendingRecipeEditPage.jsx";

const App = () => {
    const location = useLocation();  // Get the current location

    // Define routes where you want to exclude Header and Footer
    const excludeHeaderFooterRoutes = ['/login', '/register', '/admin/dashboard', '/admin/recipes', '/admin/recipes/add', '/admin/recipes/edit/:id', '/admin/ingredients', '/admin/recipes/add'];

    // Check if the current route is in the exclusion list or starts with an excluded path
    const shouldShowHeaderFooter = !excludeHeaderFooterRoutes.some(route => location.pathname === route || (route.includes(':') && location.pathname.startsWith(route.split(':')[0])));

    return (<AuthProvider>
        {shouldShowHeaderFooter && <Header/>}
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/recipes" element={<RecipePage/>}/>
            <Route path="/recipe/:id" element={<RecipeDetail/>}/>
            <Route path="/admin/recipes/add" element={<EditRecipe/>}/>
            <Route path="/admin/recipes/edit/:id" element={<EditRecipe/>}/>
            <Route path="/recipes/add" element={<PendingRecipeEditPage/>}/>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute/>}>
                <Route path="/pantry" element={<Pantry/>}/>
                <Route path="/admin/dashboard"
                       element={
                           <AdminProtectedRoute><AdminDashboard/></AdminProtectedRoute>}/>
                <Route path="/admin/recipes" element={<ManageRecipes/>}/>
                <Route path="/admin/ingredients"
                       element={<IngredientDatabase/>}/>
            </Route>
            <Route
                path="*"
                element={<h2 className="text-center mt-20 text-red-500">
                    404 - Page Not Found
                </h2>}
            />
        </Routes>
        {shouldShowHeaderFooter && <Footer/>}
    </AuthProvider>);
};

export default App;