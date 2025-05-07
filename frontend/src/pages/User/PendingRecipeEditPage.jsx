import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import PendingRecipeIngredientManager from "./PendingRecipeIngredientManager";
import RecipeImageUploader from "../../components/Users/RecipeImageUploader";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export default function PendingRecipeEditPage() {
    const [recipe, setRecipe] = useState({
        title: "",
        description: "",
        instructions: "",
        cooking_time: "",
        difficulty: "",
        cuisine_type: "",
    });
    const [originalRecipe, setOriginalRecipe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("details");
    const [pendingRecipeId, setPendingRecipeId] = useState(null);
    const [message, setMessage] = useState("");

    // Get original recipe ID from URL params if editing existing recipe
    const { id: recipeId } = useParams();
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
            console.error("Error fetching recipe:", err);
            setError(
                `Failed to load recipe: ${err.response?.data?.message || err.message}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRecipe((prev) => ({ ...prev, [name]: value }));
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
                status: "pending",
                submission_type: isEditingExisting ? "edit" : "new",
            };

            // Using the correct endpoint for pending recipes
            const response = await api.post("/recipes/pending", pendingRecipeData);

            // Store the pending recipe ID
            setPendingRecipeId(response.data.recipe_id); // Updated to recipe_id based on the API response

            setMessage("Recipe details saved! Now you can add ingredients.");

            // Switch to ingredients tab
            setActiveTab("ingredients");
        } catch (err) {
            console.error("Error saving pending recipe:", err);
            setError(
                `Failed to save recipe: ${err.response?.data?.message || err.message}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/recipes");
    };

    const handleFinish = async () => {
        try {
            setLoading(true);

            // Update the pending recipe status to ensure it's marked as pending
            await api.put(`/recipes/pending/${pendingRecipeId}/status`, {
                status: 'pending'
            });

            // Show success message
            setMessage("Your recipe has been submitted for review!");

            // Create a modal popup with more detailed information
            const modalContainer = document.createElement('div');
            modalContainer.className = 'fixed inset-0 flex items-center justify-center z-50';
            modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50"></div>
      <div class="bg-white rounded-lg p-8 max-w-md relative z-10 shadow-xl">
        <h2 class="text-2xl font-bold mb-4 text-green-600">Recipe Submitted!</h2>
        <p class="mb-4">Your recipe has been submitted for review by our team. Once approved, it will appear in the recipes section.</p>
        <p class="mb-6 text-gray-600">Thank you for contributing to our community!</p>
        <button id="closeModalBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          OK, I understand
        </button>
      </div>
    `;

            document.body.appendChild(modalContainer);

            // Add event listener to close button
            document.getElementById('closeModalBtn').addEventListener('click', () => {
                document.body.removeChild(modalContainer);
                navigate("/recipes");
            });

        } catch (err) {
            console.error("Error finalizing submission:", err);
            setError(
                `Failed to submit recipe: ${err.response?.data?.message || err.message}`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <Link to="/recipes" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to All Recipes
                </Link>

                <main className="bg-white shadow-sm rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {isEditingExisting
                                ? "Propose Changes to Recipe"
                                : "Submit New Recipe"}
                        </h1>
                        <p className="text-gray-600">
                            {isEditingExisting
                                ? "Your changes will be reviewed by our team before being published."
                                : "Share your favorite recipe with our community. All submissions will be reviewed."}
                        </p>
                    </div>

                    {message && (
                        <div className="mx-6 mt-6 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {message}
                        </div>
                    )}

                    {loading && !recipe.title && (
                        <div className="p-6 flex justify-center">
                            <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}

                    {error && (
                        <div className="mx-6 mt-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Tabs Navigation */}
                    <div className="px-6 border-b border-gray-100">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "details"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Recipe Details
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("ingredients")}
                                disabled={!pendingRecipeId}
                                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "ingredients"
                                        ? "border-blue-500 text-blue-600"
                                        : !pendingRecipeId
                                            ? "border-transparent text-gray-300 cursor-not-allowed"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                    Ingredients
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("image")}
                                disabled={!pendingRecipeId}
                                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "image"
                                        ? "border-blue-500 text-blue-600"
                                        : !pendingRecipeId
                                            ? "border-transparent text-gray-300 cursor-not-allowed"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Recipe Image
                                </div>
                            </button>
                        </nav>
                    </div>

                    {/* Recipe Details Form */}
                    {activeTab === "details" && (
                        <div className="p-6">
                            {isEditingExisting && originalRecipe && (
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-blue-700 font-medium">You are proposing changes to an existing recipe</p>
                                        <p className="text-blue-600 text-sm mt-1">Your modifications will be reviewed by our team before being published.</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={recipe.title}
                                            onChange={handleInputChange}
                                            required
                                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Recipe title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                                        <input
                                            type="text"
                                            name="cuisine_type"
                                            value={recipe.cuisine_type}
                                            onChange={handleInputChange}
                                            required
                                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Italian, Mexican, Chinese, etc."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cooking Time (minutes)</label>
                                        <input
                                            type="number"
                                            name="cooking_time"
                                            value={recipe.cooking_time}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                        <select
                                            name="difficulty"
                                            value={recipe.difficulty}
                                            onChange={handleInputChange}
                                            required
                                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        >
                                            <option value="">Select Difficulty</option>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={recipe.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder="Write a brief description of your recipe..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                                    <textarea
                                        name="instructions"
                                        value={recipe.instructions}
                                        onChange={handleInputChange}
                                        rows={6}
                                        required
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder="Detailed step-by-step instructions for your recipe..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 flex items-center"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                </svg>
                                                Save Recipe Details
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Ingredients Management */}
                    {activeTab === "ingredients" && pendingRecipeId && (
                        <div className="p-6">
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <p className="text-yellow-800 font-medium">Make sure to add all ingredients needed for your recipe</p>
                                    <p className="text-yellow-700 text-sm mt-1">Please include measurements for each ingredient.</p>
                                </div>
                            </div>

                            <PendingRecipeIngredientManager
                                pendingRecipeId={pendingRecipeId}
                                originalRecipeId={isEditingExisting ? recipeId : null}
                            />

                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
                                <button
                                    onClick={() => setActiveTab("image")}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                    Next: Add Image
                                </button>
                                <button
                                    onClick={handleFinish}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Submit Recipe for Review
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Image Upload */}
                    {activeTab === "image" && pendingRecipeId && (
                        <div className="p-6">
                            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <p className="text-green-800 font-medium">Add a photo of your recipe</p>
                                    <p className="text-green-700 text-sm mt-1">A high-quality image will make your recipe more appealing to other users.</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                <RecipeImageUploader recipeId={pendingRecipeId} />
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={handleFinish}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Submit Recipe for Review
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer section */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center text-gray-500 text-sm">
                        <p>Our team will review your submission within 24-48 hours.</p>
                        <p>Thank you for contributing to our recipe collection!</p>
                    </div>
                </main>
            </div>
        </div>
    );
}