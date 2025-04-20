import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext.jsx'; // Adjust the path if needed

const AdminProtectedRoute = ({children}) => {
    const {user, loading, isAdmin} = useAuth(); // Use the isAdmin function from useAuth
    console.log("AdminProtectedRoute - user:", user);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace/>;
    }

    if (!isAdmin()) { // Use the isAdmin function
        return <h2 className="text-center mt-20 text-red-500">Unauthorized</h2>;
    }

    return children;
};

export default AdminProtectedRoute;