import React, {createContext, useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Load user from localStorage on app start
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        console.log("Loading user from localStorage:", userInfo);

        try {
            if (userInfo) {
                const parsedUser = JSON.parse(userInfo);
                console.log("Parsed user object:", parsedUser);
                console.log("User role:", parsedUser.role);
                setUser(parsedUser);
            }
        } catch (error) {
            console.error("Error parsing userInfo from localStorage", error);
            localStorage.removeItem('userInfo');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Login user
    const login = async (userData) => {
        // Make sure role is included and properly formatted in userData
        console.log("Login with userData:", userData);

        // If role is missing or needs transformation, handle it here
        // Example: if (userData && !userData.role) userData.role = 'user';

        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
        navigate('/');
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/login');
    };

    // More flexible isAdmin function that handles different role formats
    const isAdmin = () => {
        if (!user) return false;

        // Handle different possible role structures
        if (user.role === 'admin') return true;
        if (user.role === 'Admin' || user.role === 'ADMIN') return true;
        if (user.isAdmin === true) return true;
        if (user.roles && Array.isArray(user.roles) && user.roles.includes('admin')) return true;
        if (user.permissions && Array.isArray(user.permissions) && user.permissions.includes('admin')) return true;

        console.log("User is not admin. User object:", user);
        return false;
    };

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