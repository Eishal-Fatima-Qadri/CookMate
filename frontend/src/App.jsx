import React from 'react';
import {Route, Routes, useLocation} from 'react-router-dom'; // Import useLocation
import {AuthProvider} from './context/AuthContext'; // Adjust the path if needed
import Home from './pages/Home.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';
import Header from './components/Header';
import Pantry from './pages/Pantry.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import RecipePage from './pages/RecipePage';
import RecipeDetail from './components/RecipeDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';

const App = () => {
    const location = useLocation();  // Get the current location

    // Define routes where you want to exclude Header and Footer
    const excludeHeaderFooterRoutes = ['/admin-dashboard']; // Add more routes as needed

    // Check if the current route is in the exclusion list
    const shouldShowHeaderFooter = !excludeHeaderFooterRoutes.includes(location.pathname);

    return (
        <AuthProvider>
            {shouldShowHeaderFooter && <Header/>} {/* Conditional rendering */}
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/recipes" element={<RecipePage/>}/>
                <Route path="/recipe/:id" element={<RecipeDetail/>}/>
                {/* Protected Routes */}
                <Route element={<ProtectedRoute/>}>
                    <Route path="/pantry" element={<Pantry/>}/>
                    <Route path="/admin-dashboard"
                           element={<AdminProtectedRoute><AdminDashboard/></AdminProtectedRoute>}/>
                </Route>
                <Route
                    path="*"
                    element={
                        <h2 className="text-center mt-20 text-red-500">
                            404 - Page Not Found
                        </h2>
                    }
                />
            </Routes>
            {shouldShowHeaderFooter && <Footer/>} {/* Conditional rendering */}
        </AuthProvider>
    );
};

export default App;
