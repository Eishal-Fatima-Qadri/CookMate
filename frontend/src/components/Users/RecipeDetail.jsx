// RecipeDetail.js
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

const RecipeDetail = () => {
    const {id} = useParams();
    const [recipe, setRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [steps, setSteps] = useState([]);
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecipeDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const recipeRes = await api.get(`/recipes/${id}`);
                setRecipe(recipeRes.data);

                const ingredientsRes = await api.get(`/recipes/${id}/ingredients`);
                setIngredients(ingredientsRes.data);

                const stepsRes = await api.get(`/recipes/${id}/steps`);
                setSteps(stepsRes.data);

                // Try to fetch the recipe image URL
                try {
                    const imageRes = await api.get(`/recipes/${id}/image`);
                    setImageUrl(imageRes.data.image_url);
                } catch (imageErr) {
                    // If image not found, just continue without setting an image URL
                    console.log('No image found for this recipe');
                }

            } catch (err) {
                console.error('Error fetching recipe details:', err);
                setError(`Failed to load recipe details: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeDetails();
    }, [id]);

    if (loading) {
        return <div className="text-center py-8 text-gray-600">Loading recipe details...</div>;
    }

    if (error) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>;
    }

    if (!recipe) {
        return <div className="text-center py-8 text-gray-600">Recipe not found.</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <main className="max-w-3xl mx-auto bg-white shadow-md rounded-md p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{recipe.title}</h1>

                {/* Recipe Image Section */}
                <div className="w-full h-64 bg-gray-200 rounded-md mb-6 overflow-hidden">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                console.error("Image failed to load:", imageUrl);
                                e.target.onerror = null;
                                e.target.parentNode.innerHTML = `
                                    <div class="flex items-center justify-center h-full text-gray-500">
                                        <div class="text-center">
                                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="mt-1">Image failed to load</p>
                                        </div>
                                    </div>
                                `;
                            }}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="mt-1">No image available</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
                    <p className="text-gray-600 leading-relaxed">{recipe.description}</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Ingredients</h2>
                    {ingredients.length > 0 ? (
                        <ul className="list-disc pl-6 text-gray-600">
                            {ingredients.map(ingredient => (
                                <li key={ingredient.ingredient_id}>
                                    {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No ingredients listed.</p>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Instructions</h2>
                    {recipe.instructions ? (
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {recipe.instructions}
                        </div>
                    ) : (
                        <p className="text-gray-500">No instructions provided.</p>
                    )}
                </div>

                {steps.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Steps</h2>
                        <ol className="list-decimal pl-6 text-gray-600">
                            {steps.map((step, index) => (
                                <li key={index} className="mb-2">
                                    {step.description}
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                <div className="mt-8 border-t pt-4 text-gray-500 text-sm">
                    Created At: {new Date(recipe.created_at).toLocaleDateString()}
                    <br/>
                    Last Updated: {new Date(recipe.updated_at).toLocaleDateString()}
                </div>
            </main>
        </div>
    );
};

export default RecipeDetail;