const express = require('express');
const router = express.Router();
const PromoCode = require('../models/promoCode');
router.get('/', async (req, res) => {
    try {
        const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
        res.render('admin/promo_codes_list', {
            title: 'Kelola Kode Promo',
            promoCodes,
            currentPath: '/admin/promocodes',
            isAdminRoute: true,
            logoSvgContent: req.logoSvgContent,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.get('/add', (req, res) => {
    res.render('admin/promo_code_form', {
        title: 'Tambah Kode Promo',
        promoCode: null,
        currentPath: '/admin/promocodes/add',
        isAdminRoute: true,
        logoSvgContent: req.logoSvgContent,
        user: req.user,
        formAction: '/admin/promocodes/add'
    });
});

router.post('/add', async (req, res) => {
    try {
        const { code, discountType, discountValue, description, expiryDate, maxUses, minOrderAmount } = req.body;
        await PromoCode.create({
            code,
            discountType,
            discountValue,
            description,
            expiryDate: expiryDate || null,
            maxUses: maxUses || null,
            minOrderAmount: minOrderAmount || 0,
            isActive: true
        });
        res.redirect('/admin/promocodes');
    } catch (error) {
        console.error(error);
        let errorMessage = "Server Error";
        if (error.code === 11000) { 
            errorMessage = "Kode promo sudah ada. Harap gunakan kode unik.";
        }
        res.status(500).render('admin/promo_code_form', {
            title: 'Tambah Kode Promo',
            promoCode: req.body,
            currentPath: '/admin/promocodes/add',
            isAdminRoute: true,
            logoSvgContent: req.logoSvgContent,
            user: req.user,
            formAction: '/admin/promocodes/add',
            error: errorMessage
        });
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);
        if (!promoCode) return res.status(404).send('Kode promo tidak ditemukan');
        res.render('admin/promo_code_form', {
            title: 'Edit Kode Promo',
            promoCode: {
                ...promoCode.toObject(),
                expiryDate: promoCode.expiryDate ? promoCode.expiryDate.toISOString().split('T')[0] : ''
            },
            currentPath: '/admin/promocodes/edit',
            isAdminRoute: true,
            logoSvgContent: req.logoSvgContent,
            user: req.user,
            formAction: `/admin/promocodes/edit/${promoCode._id}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.post('/edit/:id', async (req, res) => {
    try {
        const { code, discountType, discountValue, description, isActive, expiryDate, maxUses, minOrderAmount } = req.body;
        await PromoCode.findByIdAndUpdate(req.params.id, {
            code,
            discountType,
            discountValue,
            description,
            isActive: isActive === 'on',
            expiryDate: expiryDate || null,
            maxUses: maxUses || null,
            minOrderAmount: minOrderAmount || 0
        });
        res.redirect('/admin/promocodes');
    } catch (error) {
        console.error(error);
         let errorMessage = "Server Error";
        if (error.code === 11000) { 
            errorMessage = "Kode promo sudah ada. Harap gunakan kode unik.";
        }
        const promoCodeForForm = { ...req.body, _id: req.params.id };
        res.status(500).render('admin/promo_code_form', {
            title: 'Edit Kode Promo',
            promoCode: promoCodeForForm,
            currentPath: '/admin/promocodes/edit',
            isAdminRoute: true,
            logoSvgContent: req.logoSvgContent,
            user: req.user,
            formAction: `/admin/promocodes/edit/${req.params.id}`,
            error: errorMessage
        });
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        await PromoCode.findByIdAndDelete(req.params.id);
        res.redirect('/admin/promocodes');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.post('/toggle/:id', async (req, res) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);
        if (promoCode) {
            promoCode.isActive = !promoCode.isActive;
            await promoCode.save();
        }
        res.redirect('/admin/promocodes');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;