import React, {useEffect, useState} from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default function PendingRecipeIngredientManager({ pendingRecipeId, originalRecipeId }) {
    const [pendingIngredients, setPendingIngredients] = useState([]);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [originalIngredients, setOriginalIngredients] = useState([]);
    const [newIngredient, setNewIngredient] = useState({ ingredient_id: '', quantity: '', unit: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        if (pendingRecipeId) {
            fetchPendingIngredients();
            fetchAllIngredients();
            if (originalRecipeId) fetchOriginalIngredients();
        }
    }, [pendingRecipeId, originalRecipeId]);

    const fetchPendingIngredients = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/recipes/${pendingRecipeId}/pending-ingredients`);
            setPendingIngredients(response.data);
        } catch (err) {
            console.error('Error fetching pending ingredients:', err);
            setError('Failed to load pending ingredients');
        } finally {
            setLoading(false);
        }
    };

    const fetchOriginalIngredients = async () => {
        try {
            const response = await api.get(`/recipes/${originalRecipeId}/ingredients`);
            setOriginalIngredients(response.data);
        } catch (err) {
            console.error('Error fetching original ingredients:', err);
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

    const importOriginalIngredients = async () => {
        setLoading(true);
        try {
            for (const ing of originalIngredients) {
                await api.post(`/recipes/${pendingRecipeId}/pending-ingredients`, {
                    ingredient_id: ing.ingredient_id,
                    quantity: ing.quantity,
                    unit: ing.unit
                });
            }
            await fetchPendingIngredients();
        } catch (err) {
            console.error('Error importing original ingredients:', err);
            setError('Failed to import original ingredients');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
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
            await api.post(`/recipes/${pendingRecipeId}/pending-ingredients`, newIngredient);
            await fetchPendingIngredients();
            setNewIngredient({ ingredient_id: '', quantity: '', unit: '' });
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
            await api.put(`/recipes/${pendingRecipeId}/pending-ingredients/${newIngredient.ingredient_id}`, {
                quantity: newIngredient.quantity,
                unit: newIngredient.unit
            });
            await fetchPendingIngredients();
            setNewIngredient({ ingredient_id: '', quantity: '', unit: '' });
            setEditIndex(null);
        } catch (err) {
            console.error('Error updating ingredient:', err);
            setError(`Failed to update ingredient: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteIngredient = async (ingredientId) => {
        if (!window.confirm('Are you sure you want to remove this ingredient?')) return;
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/recipes/${pendingRecipeId}/pending-ingredients/${ingredientId}`);
            await fetchPendingIngredients();
        } catch (err) {
            console.error('Error deleting ingredient:', err);
            setError(`Failed to delete ingredient: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setNewIngredient({ ingredient_id: '', quantity: '', unit: '' });
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

            {/* Import Original Ingredients */}
            {originalRecipeId && originalIngredients.length > 0 && pendingIngredients.length === 0 && (
                <button
                    onClick={importOriginalIngredients}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    Import Ingredients from Original Recipe
                </button>
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
                    {pendingIngredients.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                No ingredients added yet
                            </td>
                        </tr>
                    ) : (
                        pendingIngredients.map((ingredient, index) => (
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
                                    value={pendingIngredients[editIndex]?.name || ''}
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
                                    {availableIngredients.map(ing => (
                                        <option key={ing.ingredient_id} value={ing.ingredient_id}>
                                            {ing.name}
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
                            {loading ? 'Saving...' : editIndex !== null ? 'Update' : 'Add'}
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
