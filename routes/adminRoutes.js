const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
let products = [];
const productsFilePath = path.join(__dirname, '..', 'data', 'products.json'); 
const ordersFilePath = path.join(__dirname, '..', 'data', 'orders.json');

function loadProducts() {
    try {
        if (fs.existsSync(productsFilePath)) {
            products = JSON.parse(fs.readFileSync(productsFilePath));
        } else { products = []; saveProducts(); }
    } catch (e) { console.error("[ADMIN ROUTES] Error loading products:", e.message); products = []; }
}
function saveProducts() {
    try {
        const dir = path.dirname(productsFilePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    } catch (e) { console.error("[ADMIN ROUTES] Error saving products:", e.message); }
}
loadProducts(); // Muat produk saat router di-load

function loadOrders() {
    try {
        if (fs.existsSync(ordersFilePath)) return JSON.parse(fs.readFileSync(ordersFilePath));
        return [];
    } catch (e) { console.error("[ADMIN ROUTES] Error loading orders:", e.message); return []; }
}
// saveOrders tidak perlu di sini kecuali ada rute yang mengubah order di file ini

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'products'; // Default untuk adminRoutes, bisa disesuaikan
        const p = path.join(__dirname, '..', 'public', 'uploads', dir);
        fs.mkdirSync(p, { recursive: true }); cb(null, p);
    },
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });


// Rute Dashboard
router.get('/dashboard', async(req,res)=>{
    const o=loadOrders();
    res.render('admin/dashboard',{
        title:'Admin Dashboard',
        totalProducts:products.length,
        totalOrders:o.length,
        successfulOrders:o.filter(x=>x.status==='success').length,
        currentPath:'/admin/dashboard',
        isAdminRoute:true
    });
});

// Rute Produk
router.get('/products', (req,res)=>{
    loadProducts(); 
    res.render('admin/products',{
        title:'Manage Products',
        products:products,
        currentPath:'/admin/products',
        isAdminRoute:true
    });
});
router.get('/products/add', (req,res)=>res.render('admin/add_product',{
    title:'Add New Product',
    currentPath:'/admin/products/add',
    isAdminRoute:true
}));
router.post('/products/add', upload.single('thumbnail'), (req,res)=>{
    const{name,price,description,features,priceSuffix,isPopular}=req.body;
    products.push({id:'PROD-'+Date.now(),name,price:parseInt(price),description,features:features?features.split(',').map(f=>f.trim()):[],thumbnail:req.file?`/uploads/products/${req.file.filename}`:'/assets/default-product.png',priceSuffix:priceSuffix||'',isPopular:isPopular==='on'});
    saveProducts();res.redirect('/admin/products');
});
router.get('/products/edit/:id', (req,res)=>{
    const p=products.find(x=>x.id===req.params.id);
    if(!p)return res.status(404).send('Product not found');
    res.render('admin/edit_product',{
        title:'Edit Product',
        product:p,
        currentPath:'/admin/products/edit',
        isAdminRoute:true
    });
});
router.post('/products/edit/:id', upload.single('thumbnail'), (req,res)=>{
    const{name,price,description,features,priceSuffix,isPopular,existingThumbnail}=req.body;
    const idx=products.findIndex(x=>x.id===req.params.id);
    if(idx===-1)return res.status(404).send('Product not found');
    products[idx]={...products[idx],name,price:parseInt(price),description,features:features?features.split(',').map(f=>f.trim()):[],thumbnail:req.file?`/uploads/products/${req.file.filename}`:existingThumbnail,priceSuffix:priceSuffix||'',isPopular:isPopular==='on'};
    if(req.file&&existingThumbnail&&existingThumbnail!=='/assets/default-product.png'&&!existingThumbnail.startsWith('http')){
        const op=path.join(__dirname,'..','public',existingThumbnail); if(fs.existsSync(op))fs.unlink(op,e=>e?console.error("[ADMIN ROUTES /products/edit] Error deleting old thumb:",e.message):null);
    }
    saveProducts();res.redirect('/admin/products');
});
router.post('/products/delete/:id', (req,res)=>{
    const idx=products.findIndex(x=>x.id===req.params.id);
    if(idx>-1){const p=products[idx];if(p.thumbnail&&p.thumbnail!=='/assets/default-product.png'&&!p.thumbnail.startsWith('http')){const ip=path.join(__dirname,'..','public',p.thumbnail);if(fs.existsSync(ip))fs.unlinkSync(ip);}products.splice(idx,1);saveProducts();}
    res.redirect('/admin/products');
});

// Rute Pesanan
router.get('/orders', (req,res)=>{
    const o=loadOrders().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    res.render('admin/orders',{
        title:'Order List',
        orders:o,
        currentPath:'/admin/orders',
        isAdminRoute:true
    });
});
router.get('/orders/:order_id', (req,res)=>{
    const o=loadOrders().find(x=>x.order_id===req.params.order_id);
    if(!o)return res.status(404).send('Order not found');
    res.render('admin/order_detail',{
        title:`Order Detail ${o.order_id}`,
        order:o,
        currentPath:'/admin/orders/detail',
        isAdminRoute:true
    });
});

module.exports = router;