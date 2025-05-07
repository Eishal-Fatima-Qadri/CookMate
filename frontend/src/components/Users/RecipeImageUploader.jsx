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
        <div className="mt-4">
            <h2 className="text-xl font-bold mb-4">Recipe Image</h2>

            {error && (
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {successMessage && (
                <div
                    className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {successMessage}
                </div>
            )}

            {/* Display existing image */}
            {imageUrl && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Current Image</h3>
                    <div
                        className="border rounded-lg overflow-hidden w-full max-w-lg">
                        <img
                            src={imageUrl}
                            alt="Recipe"
                            className="w-full h-auto"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                    Upload New Image
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                    Supported formats: JPG, PNG. Max size: 5MB
                </p>
            </div>

            {/* Image preview */}
            {previewUrl && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Preview</h3>
                    <div
                        className="border rounded-lg overflow-hidden w-full max-w-lg">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            )}

            <button
                onClick={uploadImage}
                disabled={!image || uploading}
                className={`px-4 py-2 rounded text-white ${
                    !image || uploading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
                {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
        </div>
    );
}