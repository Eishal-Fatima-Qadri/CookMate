import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // update path as needed

export default function AdminHeader() {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/login');
    };

    return (
        <header className="bg-indigo-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
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
                    <Link to="/admin/submissions" className="hover:underline">
                        Recipe Approvals
                    </Link>
                    <Link to="/admin/users" className="hover:underline">
                        User Management
                    </Link>
                    <Link to="/admin/activity" className="hover:underline">
                        System Activity
                    </Link>

                    {user ? (
                        <>
                            <span className="ml-4">Welcome {user.username}</span>
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