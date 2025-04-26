import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import axios from "axios";
import Header from "../../components/Admin/AdminHeader.jsx";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default function ManageRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/recipes');
            setRecipes(response.data);
            setDebugInfo(null);
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError(`Failed to load recipes: ${err.response?.data?.message || err.message}`);
            setDebugInfo(`Error details: ${JSON.stringify(err.response || err.message)}`);
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
            const response = await api.get(`/recipes/search?query=${encodeURIComponent(search)}`);
            setRecipes(response.data);
            setDebugInfo(null);
        } catch (err) {
            console.error('Search error:', err);
            setError(`Search failed: ${err.response?.data?.message || err.message}`);
            setDebugInfo(`Search error details: ${JSON.stringify(err.response || err.message)}`);
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this recipe?')) return;

        setLoading(true);
        setError(null);

        try {
            await api.delete(`/recipes/${id}`);
            fetchRecipes(); // Refresh the recipe list
        } catch (err) {
            console.error('Error deleting recipe:', err);
            setError(`Failed to delete recipe: ${err.response?.data?.message || err.message}`);
            setDebugInfo(`Delete error details: ${JSON.stringify(err.response || err.message)}`);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div>
            <Header/>
            <main className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Manage Recipes</h1>
                    <Link
                        to="/admin/recipes/add"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add New Recipe
                    </Link>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6 flex">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search recipes..."
                        className="border rounded-l px-4 py-2 flex-grow"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
                    >
                        Search
                    </button>
                </form>

                {loading && <p className="mb-4">Loading...</p>}
                {error && <p className="text-red-600 mb-4">{error}</p>}
                {debugInfo && <pre className="bg-gray-100 p-2 rounded text-sm mb-4">{debugInfo}</pre>}

                {/* Recipe List */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow rounded">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="text-left px-4 py-2">Title</th>
                            <th className="text-left px-4 py-2">Cuisine</th>
                            <th className="text-left px-4 py-2">Time</th>
                            <th className="text-left px-4 py-2">Difficulty</th>
                            <th className="text-left px-4 py-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {recipes.length > 0 ? (
                            recipes.map(recipe => (
                                <tr key={recipe.recipe_id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{recipe.title}</td>
                                    <td className="px-4 py-2">{recipe.cuisine_type}</td>
                                    <td className="px-4 py-2">{recipe.cooking_time}</td>
                                    <td className="px-4 py-2">{recipe.difficulty}</td>
                                    <td className="px-4 py-2 space-x-2">
                                        <Link
                                            to={`/admin/recipes/edit/${recipe.recipe_id}`}
                                            className="text-blue-600 hover:underline mr-3"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(recipe.recipe_id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                                    {loading ? 'Loading recipes...' : 'No recipes found'}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}