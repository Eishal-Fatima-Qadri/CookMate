import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import Header from '../../components/Admin/AdminHeader';
import RecipeIngredientsManager from '../../components/Users/RecipeIngredientManager.jsx';
import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default function EditRecipe() {
    const [recipe, setRecipe] = useState({
        title: '',
        description: '',
        instructions: '',
        cooking_time: '',
        difficulty: '',
        cuisine_type: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [createdRecipeId, setCreatedRecipeId] = useState(null);

    // Get recipe ID from URL params if editing
    const {id: recipeId} = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(recipeId);

    // Use the ID from URL or newly created recipe
    const currentRecipeId = recipeId || createdRecipeId;

    useEffect(() => {
        // If we're editing, fetch the recipe data
        if (isEditing) {
            fetchRecipe();
        }
    }, [recipeId]);

    const fetchRecipe = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/recipes/${recipeId}`);
            setRecipe(response.data);
        } catch (err) {
            console.error('Error fetching recipe:', err);
            setError(`Failed to load recipe: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setRecipe(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                // Update existing recipe
                await api.put(`/recipes/${recipeId}`, recipe);

                // If on details tab, switch to ingredients tab after saving
                if (activeTab === 'details') {
                    setActiveTab('ingredients');
                }
            } else {
                // Create new recipe
                const response = await api.post('/recipes', recipe);

                // Store the newly created recipe ID
                const newRecipeId = response.data.recipe_id;
                setCreatedRecipeId(newRecipeId);

                // Switch to ingredients tab
                setActiveTab('ingredients');
            }
        } catch (err) {
            console.error('Error saving recipe:', err);
            setError(`Failed to save recipe: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/recipes');
    };

    const handleFinish = () => {
        navigate('/admin/recipes');
    };

    return (
        <div>
            <Header/>
            <main className="container mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6">
                    {isEditing ? 'Edit Recipe' : 'Add New Recipe'}
                </h1>

                {loading && !recipe.title && <p className="mb-4">Loading...</p>}
                {error && <p className="text-red-600 mb-4">{error}</p>}

                {/* Tabs */}
                <div className="border-b mb-6">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'details'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Recipe Details
                        </button>
                        <button
                            onClick={() => setActiveTab('ingredients')}
                            disabled={!currentRecipeId}
                            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'ingredients'
                                    ? 'border-blue-500 text-blue-600'
                                    : !currentRecipeId
                                        ? 'border-transparent text-gray-300 cursor-not-allowed'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Ingredients
                        </button>
                    </nav>
                </div>

                {/* Recipe Details Form */}
                {activeTab === 'details' && (
                    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded shadow">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={recipe.title}
                                        onChange={handleInputChange}
                                        required
                                        className="border rounded px-3 py-2 w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cuisine Type</label>
                                    <input
                                        type="text"
                                        name="cuisine_type"
                                        value={recipe.cuisine_type}
                                        onChange={handleInputChange}
                                        required
                                        className="border rounded px-3 py-2 w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cooking Time (minutes)</label>
                                    <input
                                        type="number"
                                        name="cooking_time"
                                        value={recipe.cooking_time}
                                        onChange={handleInputChange}
                                        required
                                        className="border rounded px-3 py-2 w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                                    <select
                                        name="difficulty"
                                        value={recipe.difficulty}
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
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={recipe.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="border rounded px-3 py-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Instructions</label>
                                <textarea
                                    name="instructions"
                                    value={recipe.instructions}
                                    onChange={handleInputChange}
                                    rows={5}
                                    required
                                    className="border rounded px-3 py-2 w-full"
                                />
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-400"
                                >
                                    {loading ? 'Saving...' : isEditing ? 'Update Recipe' : 'Create Recipe'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Ingredients Management */}
                {activeTab === 'ingredients' && currentRecipeId && (
                    <div className="bg-gray-50 p-6 rounded shadow">
                        <RecipeIngredientsManager recipeId={currentRecipeId}/>

                        <div className="mt-6 pt-4 border-t flex justify-end">
                            <button
                                onClick={handleFinish}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Finish
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}