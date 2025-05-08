// src/components/Users/RecipeImageUploader.jsx
import React, {useEffect, useState} from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default function RecipeImageUploader({recipeId}) {
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Check for existing image
    useEffect(() => {
        const fetchExistingImage = async () => {
            try {
                const response = await api.get(`/recipes/${recipeId}/image`);
                if (response.data && response.data.image_url) {
                    setImageUrl(response.data.image_url);
                }
            } catch (err) {
                // It's fine if there's no image yet
                if (err.response && err.response.status !== 404) {
                    console.error('Error fetching image:', err);
                }
            }
        };

        if (recipeId) {
            fetchExistingImage();
        }
    }, [recipeId]);

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Check file type
        if (!selectedFile.type.match('image.*')) {
            setError('Please select an image file (PNG, JPG, JPEG)');
            return;
        }

        // Check file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setImage(selectedFile);
        setError(null);
        setSuccessMessage('');

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    const uploadImage = async () => {
        if (!image) {
            setError('Please select an image first');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccessMessage('');

        try {
            // Create form data
            const formData = new FormData();
            formData.append('image', image);

            // Upload via our backend endpoint
            const response = await axios({
                method: 'post',
                url: `http://localhost:5000/api/recipes/${recipeId}/upload-image`,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.image_url) {
                setImageUrl(response.data.image_url);
                setSuccessMessage('Image uploaded successfully!');

                // Clear the image selection after successful upload
                setImage(null);
                setPreviewUrl('');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            setError(`Failed to upload image: ${err.response?.data?.message || err.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            {error && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-6 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMessage}
                </div>
            )}

            {/* Display existing image */}
            {imageUrl && (
                <div className="mb-6 space-y-3">
                    <h3 className="font-medium text-gray-700">Current Image</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <img
                            src={imageUrl}
                            alt="Recipe"
                            className="w-full h-auto object-cover"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="mb-6 space-y-3">
                {/* File input wrapper */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                        Upload New Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 text-center transition hover:border-blue-400 focus-within:border-blue-400">
                        <div className="space-y-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="sr-only"
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                                PNG, JPG, JPEG up to 5MB
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image preview */}
            {previewUrl && (
                <div className="mb-6 space-y-3">
                    <h3 className="font-medium text-gray-700">Preview</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-auto object-cover"
                        />
                    </div>
                </div>
            )}

            <div className="flex space-x-3 mt-6">
                <button
                    onClick={uploadImage}
                    disabled={!image || uploading}
                    className={`flex items-center px-6 py-2 rounded-lg shadow-sm text-white ${
                        !image || uploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition'
                    }`}
                >
                    {uploading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload Image
                        </>
                    )}
                </button>

                {image && (
                    <button
                        onClick={() => {
                            setImage(null);
                            setPreviewUrl('');
                        }}
                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}