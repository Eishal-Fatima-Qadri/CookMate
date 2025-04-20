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

                // Assuming you have an endpoint to get recipe steps based on recipeId
                const stepsRes = await api.get(`/recipes/${id}/steps`);
                setSteps(stepsRes.data);

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

                {/* Space for an image */}
                <div className="w-full h-48 bg-gray-200 rounded-md mb-6">
                    {/* You can add an image here based on recipe.imageUrl */}
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Placeholder for Image
                    </div>
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
                                <li key={ingredient.id}>
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
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">{recipe.instructions}</div>
                    ) : (
                        <p className="text-gray-500">No instructions provided.</p>
                    )}
                </div>

                {steps.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Steps</h2>
                        <ol className="list-decimal pl-6 text-gray-600">
                            {steps.map(step => (
                                <li key={step.step_id} className="mb-2">
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