import React, {useEffect, useState} from 'react';
import Header from '../../components/Admin/AdminHeader.jsx';
import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default function IngredientDatabase() {
    const [ingredients, setIngredients] = useState([]);
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // For editing/adding ingredients
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentIngredient, setCurrentIngredient] = useState({
        ingredient_id: null,
        name: '',
        nutritional_info: ''
    });

    // For confirmation dialog
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Fetch all ingredients on the component mount
    useEffect(() => {
        fetchIngredients();
    }, []);

    // Filter ingredients when search term changes
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredIngredients(ingredients);
        } else {
            const filtered = ingredients.filter(ingredient =>
                ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredIngredients(filtered);
        }
    }, [searchTerm, ingredients]);

    const fetchIngredients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/ingredients');
            setIngredients(response.data);
            setFilteredIngredients(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch ingredients');
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const openAddModal = () => {
        setCurrentIngredient({
            ingredient_id: null,
            name: '',
            nutritional_info: ''
        });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const openEditModal = (ingredient) => {
        setCurrentIngredient({
            ingredient_id: ingredient.ingredient_id,
            name: ingredient.name,
            nutritional_info: ingredient.nutritional_info || ''
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setCurrentIngredient(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                name: currentIngredient.name,
                nutritional_info: currentIngredient.nutritional_info
            };

            if (modalMode === 'add') {
                await api.post('/ingredients', payload);
            } else {
                await api.put(`/ingredients/${currentIngredient.ingredient_id}`, payload);
            }

            // Refresh ingredients list
            await fetchIngredients();
            closeModal();

        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to save ingredient');
        }
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowConfirmation(true);
    };

    const cancelDelete = () => {
        setShowConfirmation(false);
        setDeleteId(null);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/ingredients/${deleteId}`);

            // Refresh ingredients list
            await fetchIngredients();
            setShowConfirmation(false);
            setDeleteId(null);

        } catch (err) {
            console.error('Delete error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to delete ingredient');
            setShowConfirmation(false);
        }
    };

    return (
        <div>
            <Header/>
            <main className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Ingredient Database</h1>
                    <button
                        onClick={openAddModal}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
                    >
                        Add New Ingredient
                    </button>
                </div>

                {/* Search and filters */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search ingredients..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full p-3 pl-10 border border-gray-300 rounded"
                        />
                        <svg
                            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Error:</strong> {error}
                        <button
                            className="float-right"
                            onClick={() => setError(null)}
                        >
                            &times;
                        </button>
                    </div>
                )}

                {/* Ingredient table */}
                {loading ? (
                    <div className="text-center py-8">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2">Loading ingredients...</p>
                    </div>
                ) : (
                    <>
                        <div
                            className="overflow-x-auto bg-white rounded-lg shadow">
                            <table
                                className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nutritional Info
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody
                                    className="bg-white divide-y divide-gray-200">
                                {filteredIngredients.length > 0 ? (
                                    filteredIngredients.map((ingredient) => (
                                        <tr key={ingredient.ingredient_id}
                                            className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {ingredient.ingredient_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {ingredient.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {ingredient.nutritional_info || "Not specified"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openEditModal(ingredient)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(ingredient.ingredient_id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4"
                                            className="px-6 py-4 text-center text-sm text-gray-500">
                                            No ingredients found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                            Showing {filteredIngredients.length} of {ingredients.length} ingredients
                        </div>
                    </>
                )}

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div
                            className="bg-white rounded-lg shadow-xl w-full max-w-md">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    {modalMode === 'add' ? 'Add New Ingredient' : 'Edit Ingredient'}
                                </h2>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label
                                            className="block text-gray-700 text-sm font-bold mb-2"
                                            htmlFor="name">
                                            Ingredient Name
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={currentIngredient.name}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            placeholder="Enter ingredient name"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label
                                            className="block text-gray-700 text-sm font-bold mb-2"
                                            htmlFor="nutritional_info">
                                            Nutritional Information (Optional)
                                        </label>
                                        <textarea
                                            id="nutritional_info"
                                            name="nutritional_info"
                                            value={currentIngredient.nutritional_info}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            rows="4"
                                            placeholder="Enter nutritional information"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                                        >
                                            {modalMode === 'add' ? 'Add Ingredient' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                {showConfirmation && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div
                            className="bg-white rounded-lg shadow-xl w-full max-w-md">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Confirm
                                    Deletion</h2>
                                <p className="mb-6">Are you sure you want to
                                    delete this ingredient? This action cannot
                                    be undone.</p>

                                <div className="flex justify-end">
                                    <button
                                        onClick={cancelDelete}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}