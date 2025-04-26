import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import PendingRecipeIngredientManager from './PendingRecipeIngredientManager';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default function PendingRecipeEditPage() {
    const [recipe, setRecipe] = useState({
        title: '',
        description: '',
        instructions: '',
        cooking_time: '',
        difficulty: '',
        cuisine_type: '',
    });
    const [originalRecipe, setOriginalRecipe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [pendingRecipeId, setPendingRecipeId] = useState(null);
    const [message, setMessage] = useState('');

    // Get original recipe ID from URL params if editing existing recipe
    const {id: recipeId} = useParams();
    const navigate = useNavigate();
    const isEditingExisting = Boolean(recipeId);

    useEffect(() => {
        // If editing existing recipe, fetch its data
        if (isEditingExisting) {
            fetchOriginalRecipe();
        }
    }, [recipeId]);

    const fetchOriginalRecipe = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/recipes/${recipeId}`);
            const recipeData = response.data;

            // Store original recipe data
            setOriginalRecipe(recipeData);

            // Initialize form with original recipe data
            setRecipe({
                title: recipeData.title,
                description: recipeData.description,
                instructions: recipeData.instructions,
                cooking_time: recipeData.cooking_time,
                difficulty: recipeData.difficulty,
                cuisine_type: recipeData.cuisine_type,
            });
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
            // Create a pending recipe
            const pendingRecipeData = {
                ...recipe,
                original_recipe_id: isEditingExisting ? recipeId : null,
                status: 'pending',
                submission_type: isEditingExisting ? 'edit' : 'new'
            };

            // Using the correct endpoint for pending recipes
            const response = await api.post('/recipes/pending', pendingRecipeData);

            // Store the pending recipe ID
            setPendingRecipeId(response.data.recipe_id);  // Updated to recipe_id based on the API response

            setMessage('Recipe details saved! Now you can add ingredients.');

            // Switch to ingredients tab
            setActiveTab('ingredients');
        } catch (err) {
            console.error('Error saving pending recipe:', err);
            setError(`Failed to save recipe: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/recipes');
    };

    const handleFinish = async () => {
        try {
            setLoading(true);
            // Optionally: Update the pending recipe status here if needed
            setMessage('Your recipe has been submitted for review!');
            setTimeout(() => {
                navigate('/recipes');
            }, 2000);
        } catch (err) {
            console.error('Error finalizing submission:', err);
            setError(`Failed to submit recipe: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <main
                className="max-w-4xl mx-auto bg-white shadow-md rounded-md p-6">
                <h1 className="text-2xl font-bold mb-6">
                    {isEditingExisting ? 'Propose Changes to Recipe' : 'Submit New Recipe'}
                </h1>

                {message && (
                    <div
                        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {message}
                    </div>
                )}

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
                            disabled={!pendingRecipeId}
                            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'ingredients'
                                    ? 'border-blue-500 text-blue-600'
                                    : !pendingRecipeId
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
                    <form onSubmit={handleSubmit}
                          className="bg-gray-50 p-6 rounded shadow">
                        {isEditingExisting && originalRecipe && (
                            <div
                                className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-blue-700 text-sm">
                                    You are proposing changes to an existing
                                    recipe. Your changes will be reviewed before
                                    being published.
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-1">Title</label>
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
                                    <label
                                        className="block text-sm font-medium mb-1">Cuisine
                                        Type</label>
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
                                    <label
                                        className="block text-sm font-medium mb-1">Cooking
                                        Time (minutes)</label>
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
                                    <label
                                        className="block text-sm font-medium mb-1">Difficulty</label>
                                    <select
                                        name="difficulty"
                                        value={recipe.difficulty}
                                        onChange={handleInputChange}
                                        required
                                        className="border rounded px-3 py-2 w-full"
                                    >
                                        <option value="">Select Difficulty
                                        </option>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label
                                    className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={recipe.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="border rounded px-3 py-2 w-full"
                                />
                            </div>

                            <div>
                                <label
                                    className="block text-sm font-medium mb-1">Instructions</label>
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
                                    {loading ? 'Saving...' : 'Save Recipe Details'}
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
                {activeTab === 'ingredients' && pendingRecipeId && (
                    <div className="bg-gray-50 p-6 rounded shadow">
                        <PendingRecipeIngredientManager
                            pendingRecipeId={pendingRecipeId}
                            originalRecipeId={isEditingExisting ? recipeId : null}
                        />

                        <div className="mt-6 pt-4 border-t flex justify-end">
                            <button
                                onClick={handleFinish}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Submit Recipe for Review
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}