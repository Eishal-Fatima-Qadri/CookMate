import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext"; // update path as needed

export default function AdminHeader() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="bg-indigo-800 text-white p-4 shadow-md">
            <div
                className="container mx-auto flex justify-between items-center">
                <Link to="/admin/dashboard" className="text-2xl font-bold">
                    CookMate Admin
                </Link>
                <nav className="space-x-4">
                    <Link to="/admin/recipes" className="hover:underline">
                        Manage Recipes
                    </Link>
                    <Link to="/admin/ingredients" className="hover:underline">
                        Ingredient Database
                    </Link>

                    {user ? (
                        <>
                            <span
                                className="ml-4">Welcome {user.username}</span>
                            <button
                                onClick={handleLogout}
                                className="ml-2 bg-white text-indigo-800 px-3 py-1 rounded hover:bg-indigo-100"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/admin/login" className="hover:underline">
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}