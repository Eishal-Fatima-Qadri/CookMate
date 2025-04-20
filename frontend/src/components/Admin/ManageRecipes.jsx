import React, { useState, useEffect } from 'react';
import Header from './AdminHeader';
import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

export default function ManageRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const [search, setSearch] = useState('');
    const [newRecipe, setNewRecipe] = useState({
        title: '',
        description: '',
        instructions: '',
        cooking_time: '',
        difficulty: '',
        cuisine_type: '',
    });
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);


    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/recipes');
            const text = await response.text(); // Get the raw response body

            try {
                const data = JSON.parse(text); // Manually try to parse JSON
                if (Array.isArray(data)) {
                    setRecipes(data);
                    setDebugInfo(null);
                } else {
                    console.warn('API did not return an array for recipes:', data);
                    setDebugInfo(`API returned: ${text.substring(0, 100)}...`);
                    setRecipes([]);
                }
            } catch (jsonErr) {
                console.error('Failed to parse JSON:', jsonErr);
                setDebugInfo(`Not JSON: ${text.substring(0, 100)}...`);
                setRecipes([]);
            }
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError(`Failed to load recipes: ${err.message}`);
            setDebugInfo(`Error details: ${JSON.stringify(err)}`);
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
            const response = await fetch(`http://localhost:5000/api/recipes/search?query=${encodeURIComponent(search)}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setRecipes(data);
                setDebugInfo(null);
            } else {
                console.warn('Search API did not return an array:', data);
                setDebugInfo(`Search API returned: ${JSON.stringify(data).substring(0, 100)}...`);
                setRecipes([]);
            }
        } catch (err) {
            console.error('Search error:', err);
            setError(`Search failed: ${err.message}`);
            setDebugInfo(`Search error details: ${JSON.stringify(err)}`);
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
            fetchRecipes(); // Refresh the recipe list
        } catch (error) {
            console.error('Error adding recipe:', error);
            setError(`Failed to add recipe: ${error.message}`);
            setDebugInfo(`Add error details: ${JSON.stringify(error.response || error.message)}`);
        }
    };;

    const handleEdit = (recipe) => {
        setNewRecipe({
            title: recipe.title || '',
            description: recipe.description || '',
            instructions: recipe.instructions || '',
            cooking_time: recipe.cooking_time || '',
            difficulty: recipe.difficulty || '',
            cuisine_type: recipe.cuisine_type || '',
        });
        setEditingId(recipe.recipe_id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this recipe?')) return;
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/recipes/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            fetchRecipes();
        } catch (err) {
            console.error('Error deleting recipe:', err);
            setError(`Failed to delete recipe: ${err.message}`);
            setDebugInfo(`Delete error details: ${JSON.stringify(err)}`);
        }
    };

    const handleSubmitEdit = async (event) => {
        event.preventDefault();  // Prevent page refresh on form submit

        try {
            const response = await fetch(`/api/recipes/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRecipe), // Sending the updated recipe data
            });

            const data = await response.json();

            if (response.ok) {
                // Handle successful update, maybe show a success message or redirect
                alert('Recipe updated successfully!');
                setShowForm(false);  // Hide the form after submission
                // Optionally, you can refresh the recipe list or reload the data here
            } else {
                // Handle errors
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error('Error updating recipe:', err);
            alert('An error occurred while updating the recipe.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRecipe(prev => ({ ...prev, [name]: value }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto py-8">
                <h1 className="text-2xl font-bold mb-4">Manage Recipes</h1>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-4 flex">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search recipes..."
                        className="border rounded-l px-4 py-2 flex-grow"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r">
                        Search
                    </button>
                </form>

                {loading && <p>Loading...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {debugInfo && <pre className="bg-gray-100 p-2 rounded text-sm">{debugInfo}</pre>}

                {/* Recipe List */}
                <div className="overflow-x-auto mb-6">
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
                        {recipes.map(r => (
                            <tr key={r.recipe_id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{r.title}</td>
                                <td className="px-4 py-2">{r.cuisine_type}</td>
                                <td className="px-4 py-2">{r.cooking_time}</td>
                                <td className="px-4 py-2">{r.difficulty}</td>
                                <td className="px-4 py-2 space-x-2">
                                    <button onClick={() => handleEdit(r)} className="text-blue-600 hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(r.recipe_id)} className="text-red-600 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Add / Edit Form */}
                {showForm ? (
                    <div className="bg-gray-50 p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingId ? 'Edit Recipe' : 'Add New Recipe'}
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="title"
                                    value={newRecipe.title}
                                    onChange={handleInputChange}
                                    placeholder="Title"
                                    required
                                    className="border rounded px-3 py-2 w-full"
                                />
                                <input
                                    type="text"
                                    name="cuisine_type"
                                    value={newRecipe.cuisine_type}
                                    onChange={handleInputChange}
                                    placeholder="Cuisine Type"
                                    required
                                    className="border rounded px-3 py-2 w-full"
                                />
                                <input
                                    type="number"
                                    name="cooking_time"
                                    value={newRecipe.cooking_time}
                                    onChange={handleInputChange}
                                    placeholder="Cooking Time"
                                    required
                                    className="border rounded px-3 py-2 w-full"
                                />
                                <select
                                    name="difficulty"
                                    value={newRecipe.difficulty}
                                    onChange={handleInputChange}
                                    required
                                    className="border rounded px-3 py-2 w-full"
                                >
                                    <option value="">Select Difficulty</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <textarea
                                name="description"
                                value={newRecipe.description}
                                onChange={handleInputChange}
                                placeholder="Description"
                                rows={3}
                                className="border rounded px-3 py-2 w-full"
                            />
                            <textarea
                                name="instructions"
                                value={newRecipe.instructions}
                                onChange={handleInputChange}
                                placeholder="Instructions"
                                rows={5}
                                className="border rounded px-3 py-2 w-full"
                            />
                            <div className="flex space-x-4">
                                <button
                                    onClick={editingId ? handleSubmitEdit : handleAddRecipe}
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    {editingId ? 'Update' : 'Create'}
                                </button>
                                <button
                                    onClick={() => { setShowForm(false); setEditingId(null); }}
                                    className="bg-gray-400 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
                    >
                        Add New Recipe
                    </button>
                )}
            </main>
        </div>
    );
}