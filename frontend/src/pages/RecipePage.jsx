import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

const RecipePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRecipe, setNewRecipe] = useState({
        title: '',
        description: '',
        instructions: '',
        cooking_time: '',
        difficulty: '',
        cuisine_type: '',
    });
    const [debugInfo, setDebugInfo] = useState(null);

    const fetchRecipes = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/recipes');
            if (res.data && Array.isArray(res.data)) {
                setRecipes(res.data);
                setDebugInfo(null);
            } else {
                console.warn('API did not return an array for recipes:', res.data);
                setDebugInfo(`API returned: ${JSON.stringify(res.data).substring(0, 100)}...`);
                setRecipes([]);
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            setError(`Failed to load recipes: ${error.message}`);
            setDebugInfo(`Error details: ${JSON.stringify(error.response || error.message)}`);
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecipe = async () => {
        try {
            const res = await api.post('/recipes', newRecipe);
            console.log("Add Recipe Response:", res.data);
            setNewRecipe({
                title: '',
                description: '',
                instructions: '',
                cooking_time: '',
                difficulty: '',
                cuisine_type: '',
            });
            setShowAddForm(false);
            fetchRecipes(); // Refresh the recipe list
        } catch (error) {
            console.error('Error adding recipe:', error);
            setError(`Failed to add recipe: ${error.message}`);
            setDebugInfo(`Add error details: ${JSON.stringify(error.response || error.message)}`);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/recipes/search?query=${encodeURIComponent(search)}`);
            if (res.data && Array.isArray(res.data)) {
                setRecipes(res.data);
                setDebugInfo(null);
            } else {
                console.warn('Search API did not return an array:', res.data);
                setDebugInfo(`Search API returned: ${JSON.stringify(res.data).substring(0, 100)}...`);
                setRecipes([]);
            }
        } catch (err) {
            console.error('Search error:', err);
            setError(`Search failed: ${err.message}`);
            setDebugInfo(`Search error details: ${JSON.stringify(err.response || err.message)}`);
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewRecipe({...newRecipe, [name]: value});
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <main className="max-w-4xl mx-auto bg-white shadow-md rounded-md p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Recipes</h1>

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

                <div className="mb-4 flex items-center justify-between">
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
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline ml-2"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:shadow-outline ml-4"
                    >
                        {showAddForm ? 'Cancel Add' : '➕ Add New Recipe'}
                    </button>
                </div>

                {showAddForm && (
                    <div className="mb-6 p-4 border rounded-md bg-gray-50">
                        <h2 className="text-xl font-semibold mb-2 text-gray-700">Add New Recipe</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAddRecipe();
                        }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="title"
                                       className="block text-gray-600 text-sm font-bold mb-1">Title:</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRecipe.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="cuisine_type" className="block text-gray-600 text-sm font-bold mb-1">Cuisine
                                    Type:</label>
                                <input
                                    type="text"
                                    id="cuisine_type"
                                    name="cuisine_type"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRecipe.cuisine_type}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="description"
                                       className="block text-gray-600 text-sm font-bold mb-1">Description:</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRecipe.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="difficulty"
                                       className="block text-gray-600 text-sm font-bold mb-1">Difficulty:</label>
                                <input
                                    type="text"
                                    id="difficulty"
                                    name="difficulty"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRecipe.difficulty}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-span-2">
                                <label htmlFor="instructions"
                                       className="block text-gray-600 text-sm font-bold mb-1">Instructions:</label>
                                <textarea
                                    id="instructions"
                                    name="instructions"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRecipe.instructions}
                                    onChange={handleInputChange}
                                    rows="4"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="cooking_time" className="block text-gray-600 text-sm font-bold mb-1">Cooking
                                    Time (minutes):</label>
                                <input
                                    type="number"
                                    id="cooking_time"
                                    name="cooking_time"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRecipe.cooking_time}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-span-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                                >
                                    Add Recipe
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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
                        {recipes.map(recipe => (
                            <div key={recipe.recipe_id} className="bg-white border rounded-md shadow-sm p-4">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">{recipe.title}</h2>
                                <p className="text-gray-600">{recipe.description}</p>
                                <div className="mt-2">
                                    <Link to={`/recipe/${recipe.recipe_id}`}
                                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
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