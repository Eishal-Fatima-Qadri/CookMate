import React, {createContext, useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom'; // Import useNavigate

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Initialize useNavigate

    // Load user from localStorage on app start
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        try {
            if (userInfo) {
                setUser(JSON.parse(userInfo));
            }
        } catch (error) {
            console.error("Error parsing userInfo from localStorage", error);
            // Handle the error appropriately, e.g., clear the invalid data
            localStorage.removeItem('userInfo');
            setUser(null); // Ensure user is null in case of parsing error
        } finally {
            setLoading(false);
        }
    }, []);

    // Login user
    const login = async (userData) => { // Make login async to handle promises
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
        navigate('/'); // Redirect to home on successful login
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/login'); // Redirect to login on logout
    };

    //Check if user is admin
    const isAdmin = () => {
        if (user && user.role === 'admin') {
            return true;
        }
        return false;
    }

    return (
        <AuthContext.Provider value={{user, loading, login, logout, isAdmin}}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
