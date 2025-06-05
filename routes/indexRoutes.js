const express = require('express');
const router = express.Router();
const { products } = require('../dataStore');

router.get('/', (req, res) => {
    res.render('index', {
        title: 'WANZOFC-TECH - SHOP',
        products: products,
        midtransClientKey: process.env.MIDTRANS_CLIENT_KEY
    });
});

module.exports = router;