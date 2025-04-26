// UserContext.js
import {createContext, useContext, useEffect, useState} from 'react';

const UserContext = createContext(null);

export function UserProvider({children}) {
    const [user, setUser] = useState(null);

    // This only runs once on initial load
    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (error) {
                console.error("Error parsing user info from localStorage:", error);
                localStorage.removeItem('userInfo');
            }
        }
    }, []);

    // Enhanced setUser function that maintains synchronization with localStorage
    const updateUser = (userData) => {
        if (userData === null) {
            // Handle logout
            localStorage.removeItem('userInfo');
            setUser(null);
        } else {
            // Handle login/update - Clear first to avoid stale data
            localStorage.removeItem('userInfo');
            localStorage.setItem('userInfo', JSON.stringify(userData));
            setUser(userData);
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            setUser: updateUser // Replace the original setUser with our enhanced version
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}