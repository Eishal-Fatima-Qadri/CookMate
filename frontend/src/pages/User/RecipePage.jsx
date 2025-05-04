import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const RecipePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/recipes");
      if (res.data && Array.isArray(res.data)) {
        setRecipes(res.data);
        setDebugInfo(null);
      } else {
        console.warn("API did not return an array for recipes:", res.data);
        setDebugInfo(
          `API returned: ${JSON.stringify(res.data).substring(0, 100)}...`
        );
        setRecipes([]);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setError(`Failed to load recipes: ${error.message}`);
      setDebugInfo(
        `Error details: ${JSON.stringify(error.response || error.message)}`
      );
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(
        `/recipes/search?query=${encodeURIComponent(search)}`
      );
      if (res.data && Array.isArray(res.data)) {
        setRecipes(res.data);
        setDebugInfo(null);
      } else {
        console.warn("Search API did not return an array:", res.data);
        setDebugInfo(
          `Search API returned: ${JSON.stringify(res.data).substring(
            0,
            100
          )}...`
        );
        setRecipes([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(`Search failed: ${err.message}`);
      setDebugInfo(
        `Search error details: ${JSON.stringify(err.response || err.message)}`
      );
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen py-8 ">
      <main className="max-w-4xl mx-auto bg-white shadow-md rounded-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Recipes</h1>
          <Link
            to="/recipes/add"
            className="text-white px-4 py-2 rounded hover:opacity-90 focus:outline-none focus:shadow-outline"
            style={{ backgroundColor: "#55B1AB" }}
          >
            ➕ Add New Recipe
          </Link>
        </div>

        {debugInfo && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">Debug Info:</h3>
            <pre className="text-xs overflow-x-auto mt-2">{debugInfo}</pre>
            <button
              onClick={() => setDebugInfo(null)}
              className="bg-yellow-500 text-white px-2 py-1 rounded text-xs mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              type="submit"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-cyan-700 focus:outline-none focus:shadow-outline ml-2"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {loading && (
          <div className="text-center py-4 text-gray-600">
            <p>Loading recipes...</p>
          </div>
        )}

        {!loading && recipes.length === 0 && !error && (
          <div className="text-center py-4 text-gray-600">
            <p>No recipes available. Click 'Add New Recipe' to get started!</p>
          </div>
        )}

        {!loading && recipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.recipe_id}
                className="bg-white border rounded-md shadow-sm p-4"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {recipe.title}
                </h2>
                <p className="text-gray-600">{recipe.description}</p>
                <div className="mt-2">
                  <Link
                    to={`/recipe/${recipe.recipe_id}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    View Details
                  </Link>
                  {/* You can add more buttons here for edit/delete later */}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RecipePage;
