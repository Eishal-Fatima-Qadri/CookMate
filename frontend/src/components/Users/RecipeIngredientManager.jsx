import React, {useEffect, useState} from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default function RecipeIngredientsManager({recipeId}) {
    const [ingredients, setIngredients] = useState([]);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [newIngredient, setNewIngredient] = useState({
        ingredient_id: '',
        quantity: '',
        unit: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    // Fetch recipe ingredients and all available ingredients
    useEffect(() => {
        if (recipeId) {
            fetchRecipeIngredients();
            fetchAllIngredients();
        }
    }, [recipeId]);

    const fetchRecipeIngredients = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/recipes/${recipeId}/ingredients`);
            setIngredients(response.data);
        } catch (err) {
            console.error('Error fetching recipe ingredients:', err);
            setError('Failed to load ingredients');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllIngredients = async () => {
        try {
            const response = await api.get('/ingredients');
            setAvailableIngredients(response.data);
        } catch (err) {
            console.error('Error fetching all ingredients:', err);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewIngredient(prev => ({
            ...prev,
            [name]: name === 'ingredient_id' || name === 'quantity' ? Number(value) : value
        }));
    };

    const handleAddIngredient = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post(`/recipes/${recipeId}/ingredients`, newIngredient);
            // Refresh ingredients list
            await fetchRecipeIngredients();
            // Reset form
            setNewIngredient({
                ingredient_id: '',
                quantity: '',
                unit: ''
            });
            setIsAddMode(false);
        } catch (err) {
            console.error('Error adding ingredient:', err);
            setError(`Failed to add ingredient: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (ingredient, index) => {
        setNewIngredient({
            ingredient_id: ingredient.ingredient_id,
            quantity: ingredient.quantity,
            unit: ingredient.unit
        });
        setEditIndex(index);
        setIsAddMode(false);
    };

    const handleUpdateIngredient = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.put(`/recipes/${recipeId}/ingredients/${newIngredient.ingredient_id}`, {
                quantity: newIngredient.quantity,
                unit: newIngredient.unit
            });

            // Refresh ingredients list
            await fetchRecipeIngredients();
            // Reset form
            setNewIngredient({
                ingredient_id: '',
                quantity: '',
                unit: ''
            });
            setEditIndex(null);
        } catch (err) {
            console.error('Error updating ingredient:', err);
            setError(`Failed to update ingredient: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteIngredient = async (ingredientId) => {
        if (!window.confirm('Are you sure you want to remove this ingredient?')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.delete(`/recipes/${recipeId}/ingredients/${ingredientId}`);
            // Refresh ingredients list
            await fetchRecipeIngredients();
        } catch (err) {
            console.error('Error deleting ingredient:', err);
            setError(`Failed to delete ingredient: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setNewIngredient({
            ingredient_id: '',
            quantity: '',
            unit: ''
        });
        setEditIndex(null);
        setIsAddMode(false);
    };

    return (
        <div className="space-y-6">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800">Recipe Ingredients</h2>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Ingredients Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ingredients.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                    No ingredients added yet
                                </td>
                            </tr>
                        ) : (
                            ingredients.map((ingredient, index) => (
                                <tr key={`${ingredient.ingredient_id}-${index}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ingredient.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ingredient.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ingredient.unit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <button
                                            onClick={() => handleEditClick(ingredient, index)}
                                            className="text-blue-600 hover:text-blue-800 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteIngredient(ingredient.ingredient_id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Ingredient Button */}
            {!isAddMode && editIndex === null && (
                <button
                    onClick={() => setIsAddMode(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    Add Ingredient
                </button>
            )}

            {/* Add/Edit Form */}
            {(isAddMode || editIndex !== null) && (
                <form
                    onSubmit={editIndex !== null ? handleUpdateIngredient : handleAddIngredient}
                    className="space-y-6 bg-white p-6 rounded-xl shadow"
                >
                    <h3 className="text-xl font-semibold text-gray-800">
                        {editIndex !== null ? 'Edit Ingredient' : 'Add New Ingredient'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient</label>
                            {editIndex !== null ? (
                                <input
                                    type="text"
                                    value={ingredients[editIndex]?.name || ''}
                                    disabled
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full bg-gray-100"
                                />
                            ) : (
                                <select
                                    name="ingredient_id"
                                    value={newIngredient.ingredient_id}
                                    onChange={handleInputChange}
                                    required
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                >
                                    <option value="">Select Ingredient</option>
                                    {availableIngredients.map(ingredient => (
                                        <option key={ingredient.ingredient_id}
                                                value={ingredient.ingredient_id}>
                                            {ingredient.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={newIngredient.quantity}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                required
                                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <input
                                type="text"
                                name="unit"
                                value={newIngredient.unit}
                                onChange={handleInputChange}
                                required
                                placeholder="g, ml, cups, tbsp, etc."
                                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
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
                                editIndex !== null ? 'Update' : 'Add'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}