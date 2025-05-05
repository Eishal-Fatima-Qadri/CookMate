import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext.jsx';

const ProtectedRoute = () => {
    const {user, loading} = useAuth();

    // Show loading spinner or placeholder while checking authentication
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // If user is not authenticated, redirect to login with return path
    if (!user) {
        // Store the path they were trying to access
        const returnPath = window.location.pathname;
        sessionStorage.setItem('returnPath', returnPath);
        return <Navigate to="/login" replace />;
    }

    // If user is authenticated, render the protected route
    return <Outlet />;
};

export default ProtectedRoute;