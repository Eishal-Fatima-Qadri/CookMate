import React, {useEffect, useState} from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default function PendingRecipeIngredientManager({
                                                           pendingRecipeId,
                                                           originalRecipeId
                                                       }) {
    const [pendingIngredients, setPendingIngredients] = useState([]);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [originalIngredients, setOriginalIngredients] = useState([]);
    const [newIngredient, setNewIngredient] = useState({
        ingredient_id: '',
        quantity: '',
        unit: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    // Fetch pending recipe ingredients, all available ingredients, and original ingredients if editing
    useEffect(() => {
        if (pendingRecipeId) {
            fetchPendingIngredients();
            fetchAllIngredients();

            // If we're editing an existing recipe, get its original ingredients
            if (originalRecipeId) {
                fetchOriginalIngredients();
            }
        }
    }, [pendingRecipeId, originalRecipeId]);

    const fetchPendingIngredients = async () => {
        setLoading(true);
        try {
            // Updated route to use the correct endpoint
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
            // Create pending ingredients based on original recipe ingredients
            for (const ingredient of originalIngredients) {
                // Updated route to use the correct endpoint
                await api.post(`/recipes/${pendingRecipeId}/pending-ingredients`, {
                    ingredient_id: ingredient.ingredient_id,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit
                });
            }
            // Refresh the pending ingredients list
            await fetchPendingIngredients();
        } catch (err) {
            console.error('Error importing original ingredients:', err);
            setError('Failed to import original ingredients');
        } finally {
            setLoading(false);
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
            // Updated route to use the correct endpoint
            await api.post(`/recipes/${pendingRecipeId}/pending-ingredients`, newIngredient);
            // Refresh ingredients list
            await fetchPendingIngredients();
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
            // Updated route to use the correct endpoint
            await api.put(`/recipes/${pendingRecipeId}/pending-ingredients/${newIngredient.ingredient_id}`, {
                quantity: newIngredient.quantity,
                unit: newIngredient.unit
            });

            // Refresh ingredients list
            await fetchPendingIngredients();
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
            // Updated route to use the correct endpoint
            await api.delete(`/recipes/${pendingRecipeId}/pending-ingredients/${ingredientId}`);
            // Refresh ingredients list
            await fetchPendingIngredients();
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
        <div className="mt-4">
            <h2 className="text-xl font-bold mb-4">Recipe Ingredients</h2>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* Import option when editing an existing recipe */}
            {originalRecipeId && originalIngredients.length > 0 && pendingIngredients.length === 0 && (
                <div className="mb-4">
                    <button
                        onClick={importOriginalIngredients}
                        className="bg-blue-100 text-blue-700 border border-blue-300 px-4 py-2 rounded hover:bg-blue-200"
                    >
                        Import Ingredients from Original Recipe
                    </button>
                </div>
            )}

            <div className="mb-4">
                <table className="min-w-full bg-white border shadow-sm">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b text-left">Ingredient</th>
                        <th className="py-2 px-4 border-b text-left">Quantity</th>
                        <th className="py-2 px-4 border-b text-left">Unit</th>
                        <th className="py-2 px-4 border-b text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pendingIngredients.length === 0 ? (
                        <tr>
                            <td colSpan="4"
                                className="py-4 px-4 text-center text-gray-500">
                                No ingredients added yet
                            </td>
                        </tr>
                    ) : (
                        pendingIngredients.map((ingredient, index) => (
                            <tr key={`${ingredient.ingredient_id}-${index}`}
                                className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4">{ingredient.name}</td>
                                <td className="py-2 px-4">{ingredient.quantity}</td>
                                <td className="py-2 px-4">{ingredient.unit}</td>
                                <td className="py-2 px-4">
                                    <button
                                        onClick={() => handleEditClick(ingredient, index)}
                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteIngredient(ingredient.ingredient_id)}
                                        className="text-red-500 hover:text-red-700"
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

            {/* Add a new ingredient button */}
            {!isAddMode && editIndex === null && (
                <button
                    onClick={() => setIsAddMode(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add Ingredient
                </button>
            )}

            {/* Add/Edit an ingredient form */}
            {(isAddMode || editIndex !== null) && (
                <form
                    onSubmit={editIndex !== null ? handleUpdateIngredient : handleAddIngredient}
                    className="bg-gray-50 p-4 rounded border mt-4"
                >
                    <h3 className="text-lg font-medium mb-3">
                        {editIndex !== null ? 'Edit Ingredient' : 'Add New Ingredient'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label
                                className="block text-sm font-medium mb-1">Ingredient</label>
                            {editIndex !== null ? (
                                <input
                                    type="text"
                                    value={pendingIngredients[editIndex]?.name || ''}
                                    disabled
                                    className="border rounded px-3 py-2 w-full bg-gray-100"
                                />
                            ) : (
                                <select
                                    name="ingredient_id"
                                    value={newIngredient.ingredient_id}
                                    onChange={handleInputChange}
                                    required
                                    className="border rounded px-3 py-2 w-full"
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
                            <label
                                className="block text-sm font-medium mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={newIngredient.quantity}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                required
                                className="border rounded px-3 py-2 w-full"
                            />
                        </div>
                        <div>
                            <label
                                className="block text-sm font-medium mb-1">Unit</label>
                            <input
                                type="text"
                                name="unit"
                                value={newIngredient.unit}
                                onChange={handleInputChange}
                                required
                                placeholder="g, ml, cups, tbsp, etc."
                                className="border rounded px-3 py-2 w-full"
                            />
                        </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
                        >
                            {loading ? 'Saving...' : editIndex !== null ? 'Update' : 'Add'}
                        </button>
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}