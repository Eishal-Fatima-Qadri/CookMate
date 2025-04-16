import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-orange-500 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
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
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
