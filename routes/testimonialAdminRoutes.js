const express = require('express');
const router = express.Router();
const Testimonial = require('../models/testimonial');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'testimonials');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.render('admin/testimonials_list', {
            title: 'Kelola Testimoni',
            testimonials,
            currentPath: '/admin/testimonials',
            isAdminRoute: true,
            logoSvgContent: req.logoSvgContent,
            user: req.user,
            BASE_URL: req.protocol + '://' + req.get('host')
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.get('/add', (req, res) => {
    res.render('admin/testimonial_form', {
        title: 'Tambah Testimoni',
        testimonial: null,
        currentPath: '/admin/testimonials/add',
        isAdminRoute: true,
        logoSvgContent: req.logoSvgContent,
        user: req.user,
        formAction: '/admin/testimonials/add'
    });
});

router.post('/add', upload.single('image'), async (req, res) => {
    const { name, quote, rating } = req.body;
    let imagePath = '';
    if (req.file) {
        imagePath = '/uploads/testimonials/' + req.file.filename;
    }
    try {
        await Testimonial.create({ name, quote, rating, imagePath, approved: false });
        res.redirect('/admin/testimonials');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) return res.status(404).send('Testimonial not found');
        res.render('admin/testimonial_form', {
            title: 'Edit Testimoni',
            testimonial,
            currentPath: '/admin/testimonials/edit',
            isAdminRoute: true,
            logoSvgContent: req.logoSvgContent,
            user: req.user,
            formAction: `/admin/testimonials/edit/${testimonial._id}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.post('/edit/:id', upload.single('image'), async (req, res) => {
    const { name, quote, rating, approved, existingImagePath } = req.body;
    let imagePath = existingImagePath;
    if (req.file) {
        imagePath = '/uploads/testimonials/' + req.file.filename;
        if (existingImagePath && existingImagePath !== '/path/to/default-testimonial.png') {
            const oldPath = path.join(__dirname, '..', 'public', existingImagePath);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
    }
    try {
        await Testimonial.findByIdAndUpdate(req.params.id, {
            name,
            quote,
            rating,
            imagePath,
            approved: approved === 'on'
        });
        res.redirect('/admin/testimonials');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (testimonial && testimonial.imagePath && testimonial.imagePath !== '/path/to/default-testimonial.png') {
             const imageFilePath = path.join(__dirname, '..', 'public', testimonial.imagePath);
             if (fs.existsSync(imageFilePath)) {
                fs.unlinkSync(imageFilePath);
            }
        }
        await Testimonial.findByIdAndDelete(req.params.id);
        res.redirect('/admin/testimonials');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.post('/approve/:id', async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (testimonial) {
            testimonial.approved = !testimonial.approved;
            await testimonial.save();
        }
        res.redirect('/admin/testimonials');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});


module.exports = router;