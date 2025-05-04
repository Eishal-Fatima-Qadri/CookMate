import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; // update path as needed

export default function Header() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
  };

  return (
    <header
      style={{ backgroundColor: "#f87171" }}
      className="text-white p-4 shadow-md"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl tracking-wide"
          style={{ fontFamily: "'Pacifico', cursive" }}
        >
          CookMate
        </Link>

        <nav className="space-x-4">
          <Link to="/recipes" className="hover:underline">
            Recipes
          </Link>
          <Link to="/suggestions" className="hover:underline">
            Suggestions
          </Link>
          <Link to="/pantry" className="hover:underline">
            My Pantry
          </Link>
          <Link to="/favorites" className="hover:underline">
            Favorites
          </Link>

          {user ? (
            <>
              <span className="ml-4">Hello, {user.username}!</span>
              <button
                onClick={handleLogout}
                className="ml-2 bg-white text-orange-500 px-3 py-1 rounded hover:bg-orange-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
