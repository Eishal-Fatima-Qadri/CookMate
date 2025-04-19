import {createContext, useContext, useEffect, useState} from 'react';

const UserContext = createContext(null);

export function UserProvider({children}) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
