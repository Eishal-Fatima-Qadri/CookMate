// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sql = require('mssql');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Create the multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    // Accept only images
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload to ImgBB
const uploadToImgBB = async (filePath) => {
  try {
    // Create a form data object
    const formData = new FormData();
    formData.append('image', fs.createReadStream(filePath));

    // Use ImgBB API key from environment variables or default value for testing
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    
    // Send the request to ImgBB
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        }
      }
    );
    
    // Return the URL from the response
    return response.data.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw error;
  }
};

// Route to upload image
router.post('/:recipeId/upload-image', upload.single('image'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const recipeId = parseInt(req.params.recipeId, 10);
    if (isNaN(recipeId)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    // Upload file to ImgBB
    const imageUrl = await uploadToImgBB(req.file.path);

    // Use the pool from the request
    const pool = req.pool;
    
    // Store image URL in database
    const request = pool.request();
    request.input('recipeId', sql.Int, recipeId);
    request.input('imageUrl', sql.VarChar(500), imageUrl);

    // Check if there's already an image for this recipe
    const checkResult = await request.query(
      `SELECT id FROM recipe_images WHERE recipe_id = @recipeId`
    );

    if (checkResult.recordset.length > 0) {
      // Update existing record
      await request.query(
        `UPDATE recipe_images SET image_url = @imageUrl WHERE recipe_id = @recipeId`
      );
    } else {
      // Insert new record
      await request.query(
        `INSERT INTO recipe_images (recipe_id, image_url) VALUES (@recipeId, @imageUrl)`
      );
    }

    // Clean up the temporary file
    fs.unlinkSync(req.file.path);

    // Send success response
    res.json({ 
      status: 'success', 
      message: 'Image uploaded successfully',
      image_url: imageUrl
    });
  } catch (error) {
    console.error('Error in image upload:', error);
    
    // Clean up the file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Failed to upload image' 
    });
  }
});

// Route to get image URL
router.get('/:id/image', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id, 10);
    
    // Use the pool from the request
    const pool = req.pool;
    
    const request = pool.request();
    request.input('recipeId', sql.Int, recipeId);
    
    const result = await request.query(
      `SELECT image_url FROM recipe_images WHERE recipe_id = @recipeId`
    );
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        status: 'not_found',
        message: 'No image found for this recipe'
      });
    }
    
    res.json({
      image_url: result.recordset[0].image_url
    });
  } catch (error) {
    console.error('Error getting image URL:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get image URL'
    });
  }
});

module.exports = router;