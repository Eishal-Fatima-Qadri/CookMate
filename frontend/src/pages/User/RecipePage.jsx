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
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header with subtle shadow */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Recipe Collection</h1>
                <p className="text-gray-500">Discover, organize, and enjoy your favorite dishes</p>
              </div>
              <Link
                  to="/recipes/add"
                  className="hover:brightness-110 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-md"
                  style={{ backgroundColor: "#55B1AB" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Recipe
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar with search */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Search Recipes</h2>

                {/* Search bar with icon */}
                <div className="relative mb-4">
                  <input
                      type="text"
                      placeholder="Find a recipe..."
                      value={search}
                      onChange={handleSearchChange}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
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

                <div className="text-sm text-gray-500 mt-6">
                  {recipes.length > 0 && `Showing ${recipes.length} recipes`}
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-3">
              {/* Debug info */}
              {debugInfo && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg mb-6 shadow-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Debug Info
                      </h3>
                      <button
                          onClick={() => setDebugInfo(null)}
                          className="text-yellow-600 hover:text-yellow-900 rounded-full hover:bg-yellow-100 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <pre className="text-xs overflow-x-auto mt-2 bg-yellow-100 p-3 rounded">{debugInfo}</pre>
                  </div>
              )}

              {/* Error message */}
              {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
                    <div className="flex justify-between items-center">
                      <strong className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Error:
                      </strong> {error}
                      <button
                          className="text-red-600 hover:text-red-900 rounded-full hover:bg-red-100 p-1"
                          onClick={() => setError(null)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
              )}

              {/* Loading state */}
              {loading ? (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your delicious recipes...</p>
                  </div>
              ) : (
                  <>
                    {/* Empty state */}
                    {recipes.length === 0 && !error && (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                          <div className="mx-auto h-24 w-24 text-gray-300 mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">No recipes yet</h3>
                          <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Your culinary journey starts here. Click 'Add New Recipe' to begin building your collection!
                          </p>
                          <Link
                              to="/recipes/add"
                              className="hover:brightness-110 text-white font-medium py-3 px-6 rounded-lg transition-all inline-flex items-center"
                              style={{ backgroundColor: "#55B1AB" }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add New Recipe
                          </Link>
                        </div>
                    )}

                    {/* Recipe Grid */}
                    {recipes.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {recipes.map((recipe) => (
                              <div
                                  key={recipe.recipe_id}
                                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full border border-gray-100"
                              >
                                {/* Recipe card header with color strip */}
                                <div className="h-2" style={{ backgroundColor: "#55B1AB" }}></div>

                                <div className="p-6 flex-1 flex flex-col">
                                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    {recipe.title}
                                  </h2>
                                  <p className="text-gray-600 mb-6 flex-1">
                                    {recipe.description}
                                  </p>

                                  {/* Card footer */}
                                  <div className="mt-auto">
                                    {/* Tags section with improved styles */}
                                    <div className="flex flex-wrap gap-2 mb-5">
                                      {recipe.cuisine_type && (
                                          <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-100 inline-flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                            {recipe.cuisine_type}
                                </span>
                                      )}
                                      {recipe.cooking_time && (
                                          <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full border border-green-100 inline-flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                            {recipe.cooking_time}
                                </span>
                                      )}
                                      {recipe.difficulty && (
                                          <span className="bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full border border-purple-100 inline-flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                            {recipe.difficulty}
                                </span>
                                      )}
                                    </div>

                                    {/* View Details button with hover effect */}
                                    <Link
                                        to={`/recipe/${recipe.recipe_id}`}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg inline-block w-full text-center transition-colors duration-200 border border-gray-200"
                                    >
                                      View Details
                                    </Link>
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default RecipePage;