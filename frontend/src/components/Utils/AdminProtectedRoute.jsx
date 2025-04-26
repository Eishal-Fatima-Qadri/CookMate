import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext.jsx'; // Adjust the path if needed

const AdminProtectedRoute = ({children}) => {
    const {user, loading, isAdmin} = useAuth();

    // Detailed debugging
    console.log("AdminProtectedRoute - Current User:", user);
    console.log("AdminProtectedRoute - Is Loading:", loading);
    console.log("AdminProtectedRoute - Admin Check Result:", isAdmin());

    // Show loading state if still loading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div
                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // Redirect to login if no user
    if (!user) {
        console.log("No user found, redirecting to login");
        return <Navigate to="/login" replace/>;
    }

    // Check admin status
    const adminStatus = isAdmin();
    if (!adminStatus) {
        console.log("User is not an admin:", user);
        return (
            <div className="mt-20 p-4 text-center">
                <h2 className="text-red-500 text-xl font-bold">Unauthorized
                    Access</h2>
                <p className="mt-2">You do not have permission to access this
                    page.</p>
                <p className="mt-2 text-sm text-gray-500">
                    Current role: {user.role || 'No role defined'}
                </p>
            </div>
        );
    }

    // User is admin, render children
    console.log("User is admin, rendering protected content");
    return children;
};

export default AdminProtectedRoute;