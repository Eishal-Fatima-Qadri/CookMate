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

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/recipes/search?query=${encodeURIComponent(search)}`
      );
      setRecipes(response.data);
      setDebugInfo(null);
    } catch (err) {
      console.error("Search error:", err);
      setError(`Search failed: ${err.response?.data?.message || err.message}`);
      setDebugInfo(
        `Search error details: ${JSON.stringify(err.response || err.message)}`
      );
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    // Add debounce for search
    const delaySearch = setTimeout(() => {
      if (search !== "") {
        handleSearch();
      } else {
        fetchRecipes();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [search]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Recipes</h1>
          <Link
            to="/recipes/add"
            className="hover:brightness-110 text-white font-medium py-2 px-4 rounded"
            style={{ backgroundColor: "#55B1AB" }}
          >
            Add New Recipe
          </Link>
        </div>

        {/* Search bar with icon */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={handleSearchChange}
              className="w-full p-3 pl-10 border border-gray-300 rounded"
            />
            <svg
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {loading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Debug info */}
        {debugInfo && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
            <div className="flex justify-between">
              <h3 className="font-bold">Debug Info:</h3>
              <button
                onClick={() => setDebugInfo(null)}
                className="text-yellow-800 hover:text-yellow-900"
              >
                &times;
              </button>
            </div>
            <pre className="text-xs overflow-x-auto mt-2">{debugInfo}</pre>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between">
              <strong>Error:</strong> {error}
              <button
                className="text-red-700 hover:text-red-900"
                onClick={() => setError(null)}
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading recipes...</p>
          </div>
        ) : (
          <>
            {/* Empty state */}
            {recipes.length === 0 && !error && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="mt-2 text-gray-600">
                  No recipes available. Click 'Add New Recipe' to get started!
                </p>
              </div>
            )}

            {/* Recipe Grid */}
            {recipes.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map((recipe) => (
                    <div
                      key={recipe.recipe_id}
                      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
                    >
                      <div className="p-5 flex-1 flex flex-col">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                          {recipe.title}
                        </h2>
                        <p className="text-gray-600 mb-4 flex-1">
                          {recipe.description}
                        </p>

                        {/* Card footer with fixed position at the bottom */}
                        <div className="mt-auto">
                          {/* Tags section */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {recipe.cuisine_type && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {recipe.cuisine_type}
                              </span>
                            )}
                            {recipe.cooking_time && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                {recipe.cooking_time}
                              </span>
                            )}
                            {recipe.difficulty && (
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                {recipe.difficulty}
                              </span>
                            )}
                          </div>

                          {/* View Details button */}
                          <Link
                            to={`/recipe/${recipe.recipe_id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-block w-full text-center"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  Showing {recipes.length} recipes
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default RecipePage;
