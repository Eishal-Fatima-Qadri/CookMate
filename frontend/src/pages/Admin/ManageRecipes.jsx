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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentRecipe, setCurrentRecipe] = useState({
        title: '',
        cuisine_type: '',
        cooking_time: '',
        difficulty: ''
    });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchRecipes();
    }, []);

    useEffect(() => {
        // Add debounce for search
        const delaySearch = setTimeout(() => {
            if (search !== '') {
                handleSearch();
            } else {
                fetchRecipes();
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [search]);

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

    const handleSearch = async () => {
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

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowConfirmation(true);
    };

    const cancelDelete = () => {
        setShowConfirmation(false);
        setDeleteId(null);
    };

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        setShowConfirmation(false);

        try {
            await api.delete(`/recipes/${deleteId}`);
            fetchRecipes(); // Refresh the recipe list
        } catch (err) {
            console.error('Error deleting recipe:', err);
            setError(`Failed to delete recipe: ${err.response?.data?.message || err.message}`);
            setDebugInfo(`Delete error details: ${JSON.stringify(err.response || err.message)}`);
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    return (
        <div>
            <Header/>
            <main className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Manage Recipes</h1>
                    <Link
                        to="/admin/recipes/add"
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
                    >
                        Add New Recipe
                    </Link>
                </div>

                {/* Search and filters */}
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
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Error:</strong> {error}
                        <button
                            className="float-right"
                            onClick={() => setError(null)}
                        >
                            &times;
                        </button>
                    </div>
                )}
                {debugInfo && <pre
                    className="bg-gray-100 p-2 rounded text-sm mb-4">{debugInfo}</pre>}

                {/* Recipe List */}
                {loading ? (
                    <div className="text-center py-8">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2">Loading recipes...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto bg-white rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cuisine
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Difficulty
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {recipes.length > 0 ? (
                                    recipes.map(recipe => (
                                        <tr key={recipe.recipe_id}
                                            className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{recipe.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recipe.cuisine_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recipe.cooking_time}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recipe.difficulty}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/admin/recipes/edit/${recipe.recipe_id}`}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(recipe.recipe_id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5"
                                            className="px-6 py-4 text-center text-sm text-gray-500">
                                            No recipes found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                            Showing {recipes.length} recipes
                        </div>
                    </>
                )}
                {/* Delete Confirmation Dialog */}
                {showConfirmation && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div
                            className="bg-white rounded-lg shadow-xl w-full max-w-md">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Confirm
                                    Deletion</h2>
                                <p className="mb-6">Are you sure you want to
                                    delete this recipe? This action cannot
                                    be undone.</p>

                                <div className="flex justify-end">
                                    <button
                                        onClick={cancelDelete}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}