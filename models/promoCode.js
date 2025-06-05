const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date,
        required: false
    },
    maxUses: {
        type: Number,
        default: null 
    },
    timesUsed: {
        type: Number,
        default: 0
    },
    minOrderAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
module.exports = PromoCode;