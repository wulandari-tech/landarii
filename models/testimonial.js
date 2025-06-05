const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    quote: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        required: false 
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: false
    },
    approved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
module.exports = Testimonial;