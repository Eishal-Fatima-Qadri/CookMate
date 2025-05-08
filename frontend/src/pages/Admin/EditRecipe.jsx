import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import Header from "../../components/Admin/AdminHeader";
import RecipeIngredientsManager
    from "../../components/Users/RecipeIngredientManager.jsx";
import axios from "axios";
import RecipeImageUploader
    from "../../components/Users/RecipeImageUploader.jsx";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export default function EditRecipe() {
    const [recipe, setRecipe] = useState({
        title: "",
        description: "",
        instructions: "",
        cooking_time: "",
        difficulty: "",
        cuisine_type: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("details");
    const [createdRecipeId, setCreatedRecipeId] = useState(null);
    const [message, setMessage] = useState("");

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
            console.error("Error fetching recipe:", err);
            setError(
                `Failed to load recipe: ${err.response?.data?.message || err.message}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setRecipe((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                // Update existing recipe
                await api.put(`/recipes/${recipeId}`, recipe);

                setMessage("Recipe details updated successfully!");

                // If on details tab, switch to ingredients tab after saving
                if (activeTab === "details") {
                    setActiveTab("ingredients");
                }
            } else {
                // Create new recipe
                const response = await api.post("/recipes", recipe);

                // Store the newly created recipe ID
                const newRecipeId = response.data.recipe_id;
                setCreatedRecipeId(newRecipeId);

                setMessage("Recipe created successfully! Now you can add ingredients.");

                // Switch to ingredients tab
                setActiveTab("ingredients");
            }
        } catch (err) {
            console.error("Error saving recipe:", err);
            setError(
                `Failed to save recipe: ${err.response?.data?.message || err.message}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/recipes");
    };

    const handleFinish = () => {
        navigate("/admin/recipes");
    };

    return (
        <div
            className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Header/>
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Back button */}
                <Link to="/admin/recipes"
                      className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg"
                         className="h-5 w-5 mr-2" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Back to All Recipes
                </Link>

                <main className="bg-white shadow-sm rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {isEditing ? "Edit Recipe" : "Add New Recipe"}
                        </h1>
                        <p className="text-gray-600">
                            {isEditing
                                ? "Update recipe details, ingredients and image."
                                : "Create a new recipe by filling in the details below."}
                        </p>
                    </div>

                    {message && (
                        <div
                            className="mx-6 mt-6 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 className="h-5 w-5 mr-2 mt-0.5 text-green-500"
                                 viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"/>
                            </svg>
                            {message}
                        </div>
                    )}

                    {loading && !recipe.title && (
                        <div className="p-6 flex justify-center">
                            <svg className="animate-spin h-8 w-8 text-gray-400"
                                 xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12"
                                        r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}

                    {error && (
                        <div
                            className="mx-6 mt-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 className="h-5 w-5 mr-2 mt-0.5 text-red-500"
                                 viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"/>
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
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         className="h-5 w-5 mr-2" fill="none"
                                         viewBox="0 0 24 24"
                                         stroke="currentColor">
                                        <path strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                    </svg>
                                    Recipe Details
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("ingredients")}
                                disabled={!currentRecipeId}
                                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "ingredients"
                                        ? "border-blue-500 text-blue-600"
                                        : !currentRecipeId
                                            ? "border-transparent text-gray-300 cursor-not-allowed"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         className="h-5 w-5 mr-2" fill="none"
                                         viewBox="0 0 24 24"
                                         stroke="currentColor">
                                        <path strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                                    </svg>
                                    Ingredients
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("image")}
                                disabled={!currentRecipeId}
                                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "image"
                                        ? "border-blue-500 text-blue-600"
                                        : !currentRecipeId
                                            ? "border-transparent text-gray-300 cursor-not-allowed"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         className="h-5 w-5 mr-2" fill="none"
                                         viewBox="0 0 24 24"
                                         stroke="currentColor">
                                        <path strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    Recipe Image
                                </div>
                            </button>
                        </nav>
                    </div>

                    {/* Recipe Details Form */}
                    {activeTab === "details" && (
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={recipe.title}
                                            onChange={handleInputChange}
                                            required
                                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-1">
                                            Cuisine Type
                                        </label>
                                        <input
                                            type="text"
                                            name="cuisine_type"
                                            value={recipe.cuisine_type}
                                            onChange={handleInputChange}
                                            required
                                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-1">
                                            Cooking Time (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            name="cooking_time"
                                            value={recipe.cooking_time}
                                            onChange={handleInputChange}
                                            required
                                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-1">
                                            Difficulty
                                        </label>
                                        <select
                                            name="difficulty"
                                            value={recipe.difficulty}
                                            onChange={handleInputChange}
                                            required
                                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        >
                                            <option value="">Select Difficulty
                                            </option>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium
                                            </option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={recipe.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                </div>

                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1">
                                        Instructions
                                    </label>
                                    <textarea
                                        name="instructions"
                                        value={recipe.instructions}
                                        onChange={handleInputChange}
                                        rows={5}
                                        required
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                </div>

                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                                    >
                                        {loading ? "Saving..." : isEditing ? "Update Recipe" : "Create Recipe"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Ingredients Tab */}
                    {activeTab === "ingredients" && currentRecipeId && (
                        <div className="p-6">
                            <RecipeIngredientsManager
                                recipeId={currentRecipeId}/>

                            <div
                                className="mt-6 pt-4 border-t flex justify-between">
                                <button
                                    onClick={() => setActiveTab("image")}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Next: Manage Image
                                </button>
                                <button
                                    onClick={handleFinish}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Finish
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Image Upload */}
                    {activeTab === "image" && currentRecipeId && (
                        <div className="p-6">
                            <RecipeImageUploader recipeId={currentRecipeId}/>

                            <div
                                className="mt-6 pt-4 border-t flex justify-end">
                                <button
                                    onClick={handleFinish}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Finish
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}