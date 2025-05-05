import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext.jsx';

const AdminProtectedRoute = ({children}) => {
    const {user, loading, isAdmin} = useAuth();

    // Show loading state if still loading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // First check if user is logged in
    if (!user) {
        // Store the current admin path for potential redirect after login
        const adminPath = window.location.pathname;
        sessionStorage.setItem('adminReturnPath', adminPath);
        console.log("No user found, redirecting to login");
        return <Navigate to="/login" replace/>;
    }

    // Then check admin status
    if (!isAdmin()) {
        console.log("User is not an admin:", user);
        return (
            <div className="mt-20 p-4 text-center">
                <h2 className="text-red-500 text-xl font-bold">Unauthorized Access</h2>
                <p className="mt-2">You do not have permission to access this page.</p>
                <p className="mt-2 text-sm text-gray-500">
                    Current role: {user.role || 'No role defined'}
                </p>
                <button 
                    onClick={() => window.location.href = '/'} 
                    className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    // User is admin, render children
    return children;
};

export default AdminProtectedRoute;