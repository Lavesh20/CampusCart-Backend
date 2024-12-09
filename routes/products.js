const express = require('express');
const path = require("path");
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
// const upload = require('../middleware/upload');
const multer = require('multer');

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); // Fixed template literal
    },
});

const upload = multer({ storage: diskStorage });

// const upload = multer({
//     storage: multer.memoryStorage(),
//     limits: {
//         fieldSize: 5 * 1024 * 1024, // 5 MB for fields
//         fileSize: 10 * 1024 * 1024, // 10 MB for files
//     },
// });









router.post('/',  upload.single('file'), async (req, res) => {
    try {
        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Validate required fields
        const { name, description, category, countInStock, price, brand } = req.body;

        // Check if all required fields are present
        if (!name || !description || !countInStock || !price || !brand) {
            return res.status(400).json({ 
                message: "Missing required fields",
                required: "name, description, countInStock, price, and brand are required"
            });
        }

        // Validate numeric fields
        if (isNaN(countInStock) || countInStock < 0) {
            return res.status(400).json({ message: "Invalid countInStock value" });
        }

        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: "Invalid price value" });
        }

        // Create new product with all fields
        const product = new Product({
            name: name.trim(),
            description: description.trim(),
            category: category ? category.trim() : undefined,
            countInStock: Number(countInStock),
            price: Number(price),
            brand: brand.trim(),
            image: `/images/${req.file.filename}`
        });

        // Save product to database
        const savedProduct = await product.save();
        res.status(201).json({
            message: "Product created successfully",
            product: savedProduct
        });

    } catch (error) {
        // Handle specific MongoDB validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation Error", 
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        // Handle other errors
        res.status(400).json({ 
            message: "Error creating product",
            error: error.message 
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const products = await Product.find({})
            .select('image name category price') // Only select these fields
            .sort({ createdAt: -1 }); // Sort by newest first

        const formattedProducts = products.map(product => ({
            id: product._id,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.image
        }));

        res.status(200).json({
            success: true,
            count: products.length,
            products: formattedProducts
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching products",
            error: error.message 
        });
    }
});

module.exports = router;