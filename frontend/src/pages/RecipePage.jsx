import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RecipePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState('');

    const fetchRecipes = async () => {
        const fetchRecipes = async () => {
            try {
                const res = await axios.get('/api/recipes');
                setRecipes(res.data || []);
                console.log('Fetched recipes:', res.data);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            }
        };

    };

    useEffect(() => {
        fetchRecipes();
    }, []);


    const handleSearch = async () => {
        try {
            const res = await axios.get(`/api/recipes/search?query=${search}`);
            console.log('Search Results:', res.data);  // Add logging to see the search results

            if (Array.isArray(res.data)) {
                setRecipes(res.data);  // Ensure it’s an array
            } else {
                setRecipes([]);  // In case the response is not in the expected format
            }
        } catch (err) {
            console.error('Search error:', err);
            setRecipes([]);  // Default to empty array on error
        }
    };


    return (
        <>
            <main className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">🍽️ Recipe Manager</h1>

                {/* Search Bar */}
                <div className="mb-6 flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search by name or ingredient..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded px-4 py-2 w-full md:w-1/2"
                    />
                    <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Search
                    </button>
                </div>

                {/* Recipe Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {recipes.map(recipe => (
                        <div key={recipe.id} className="border p-4 rounded-lg shadow-sm bg-white">
                            <h2 className="text-xl font-semibold">{recipe.name}</h2>
                            <p className="text-gray-600 mt-1">{recipe.description}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                                    View
                                </button>
                                <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                                    Edit
                                </button>
                                <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Recipe Form */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">➕ Create New Recipe</h2>
                    <form className="grid gap-4 md:grid-cols-2">
                        <input type="text" placeholder="Recipe Name" className="border p-2 rounded" />
                        <input type="text" placeholder="Description" className="border p-2 rounded" />
                        <button className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                            Create Recipe
                        </button>
                    </form>
                </section>

                {/* Ingredients Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">🧂 Ingredients</h2>

                    <form className="grid gap-4 md:grid-cols-2">
                        <input type="text" placeholder="Recipe ID" className="border p-2 rounded" />
                        <input type="text" placeholder="Ingredient Name" className="border p-2 rounded" />
                        <input type="text" placeholder="Quantity" className="border p-2 rounded" />
                        <input type="text" placeholder="Unit (e.g. grams, cups)" className="border p-2 rounded" />

                        <button className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                            Add Ingredient to Recipe
                        </button>
                    </form>

                    <div className="mt-6 grid gap-2 md:grid-cols-2">
                        <button className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600">
                            Update Ingredient
                        </button>
                        <button className="bg-red-600 text-white py-2 rounded hover:bg-red-700">
                            Remove Ingredient
                        </button>
                    </div>
                </section>
            </main>
        </>
    );
};

export default RecipePage;
