// RecipeDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

const RecipeDetail = () => {
    const { id } = useParams();
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
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-center py-16 px-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Loading your delicious recipe...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl shadow-sm mb-4 flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-semibold mb-1">Error Loading Recipe</h3>
                            <p>{error}</p>
                            <Link to="/recipes" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to All Recipes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-12 px-4">
                <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-xl p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold mb-2">Recipe Not Found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find the recipe you're looking for.</p>
                    <Link to="/recipes" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to All Recipes
                    </Link>
                </div>
            </div>
        );
    }

    // Function to format date in a more readable way
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Back button */}
                <Link to="/recipes" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to All Recipes
                </Link>

                {/* Main content with split layout for landscape */}
                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                    <div className="lg:flex">
                        {/* Left side - Image */}
                        <div className="lg:w-1/2 relative bg-gray-100">
                            <div className="h-64 lg:h-full lg:min-h-[400px] bg-gray-100 overflow-hidden">
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
                                                        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p class="mt-2 text-lg">Image failed to load</p>
                                                    </div>
                                                </div>
                                            `;
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <div className="text-center p-4">
                                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="mt-2 text-lg">No image available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right side - Content */}
                        <div className="lg:w-1/2 p-8">
                            {/* Recipe metadata tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
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

                            <h1 className="text-3xl font-bold text-gray-800 mb-4">{recipe.title}</h1>

                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Description
                                </h2>
                                <p className="text-gray-600 leading-relaxed">{recipe.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recipe content section */}
                    <div className="px-8 py-6 border-t border-gray-100">
                        <div className="lg:flex lg:gap-12">
                            {/* Ingredients section */}
                            <div className="lg:w-1/3 mb-8 lg:mb-0">
                                <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                    Ingredients
                                </h2>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    {ingredients.length > 0 ? (
                                        <ul className="space-y-2">
                                            {ingredients.map(ingredient => (
                                                <li key={ingredient.ingredient_id} className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                                        <circle cx="10" cy="10" r="4" />
                                                    </svg>

                                                    <span>
                                                        <strong className="text-gray-700">{ingredient.name}</strong>
                                                        <span className="text-gray-500"> - {ingredient.quantity} {ingredient.unit}</span>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 italic">No ingredients listed.</p>
                                    )}
                                </div>
                            </div>

                            {/* Instructions section */}
                            <div className="lg:w-2/3">
                                <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Instructions
                                </h2>

                                {recipe.instructions ? (
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg mb-6">
                                        {recipe.instructions}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic mb-6">No instructions provided.</p>
                                )}

                                {steps.length > 0 && (
                                    <div>
                                        <h3 className="text-md font-semibold text-gray-700 mb-3">Detailed Steps</h3>
                                        <ol className="space-y-3">
                                            {steps.map((step, index) => (
                                                <li key={index} className="bg-gray-50 p-4 rounded-lg flex items-start">
                                                    <div className="bg-blue-100 text-blue-700 font-bold h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                                                        {index + 1}
                                                    </div>
                                                    <div className="text-gray-700">{step.description}</div>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer section */}
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-gray-500 text-sm flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="flex items-center mb-2 md:mb-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Created: {formatDate(recipe.created_at)}
                        </div>
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Last Updated: {formatDate(recipe.updated_at)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;