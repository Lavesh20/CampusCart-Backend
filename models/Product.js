const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    category: {
        type: String,
    },
    countInStock: {
        type: Number,
        required: [true, 'Count in stock is required'],
        min: [0, 'Count in stock cannot be negative'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
    brand: {
        type: String,
        // required: [true, 'Brand is required'],
        trim: true,
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);