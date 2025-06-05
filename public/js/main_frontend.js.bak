document.addEventListener('DOMContentLoaded', function () {
    AOS.init({
        duration: 800,
        once: true,
        offset: 50
    });

    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const sidebar = document.getElementById('sidebar');
    const mainHeaderMenuToggle = document.getElementById('menuToggle'); 
    const sidebarMenuToggle = document.getElementById('sidebarMenuToggle');
    const overlay = document.getElementById('overlay');
    const body = document.body;

    function setSidebarCookie(isOpen) {
        fetch('/toggle-sidebar-cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isOpen: isOpen })
        }).catch(err => console.error('Error setting sidebar cookie:', err));
    }

    function toggleSidebar() {
        if (sidebar) {
            const isOpen = sidebar.classList.toggle('open');
            body.classList.toggle('sidebar-open', isOpen);
            setSidebarCookie(isOpen);
        }
        if (overlay) overlay.classList.toggle('active');
        
        const iconClass = sidebar && sidebar.classList.contains('open') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        if (mainHeaderMenuToggle) mainHeaderMenuToggle.innerHTML = iconClass;
        if (sidebarMenuToggle) sidebarMenuToggle.innerHTML = iconClass;
    }
    
    if (mainHeaderMenuToggle) mainHeaderMenuToggle.addEventListener('click', toggleSidebar);
    if (sidebarMenuToggle) sidebarMenuToggle.addEventListener('click', toggleSidebar);
    if (overlay) {
        overlay.addEventListener('click', () => {
            if (sidebar && sidebar.classList.contains('open')) {
                toggleSidebar();
            }
        });
    }

    document.querySelectorAll('.sidebar-nav a[href^="/#"], .main-header-nav a[href^="/#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (window.location.pathname === '/' && this.getAttribute('href').startsWith('/#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(2);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    let offset = 0;
                    const stickyNav = document.querySelector('.main-header-nav');
                    const stickyPromo = document.querySelector('div[style*="marquee"][style*="sticky"]');
                    
                    if (stickyNav && getComputedStyle(stickyNav).position === 'sticky') offset += stickyNav.offsetHeight;
                    if (stickyPromo && getComputedStyle(stickyPromo).position === 'sticky') offset += stickyPromo.offsetHeight;
                    
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
                if (sidebar && sidebar.classList.contains('open') && window.innerWidth <= 768) {
                    toggleSidebar();
                }
            } else if (this.getAttribute('href').startsWith('/#')) {
                 window.location.href = '/' + this.getAttribute('href').substring(1);
            }
        });
    });

    const navLinks = document.querySelectorAll('.main-header-nav a, .sidebar-nav a');
    function updateActiveLink() {
        let currentSectionId = '';
        const sections = document.querySelectorAll('.content-section[id]');
        let offsetCalculation = window.innerHeight * 0.4;
        const mainNav = document.querySelector('.main-header-nav');
        const promoMarquee = document.querySelector('div[style*="marquee"][style*="sticky"]');

        if (mainNav && getComputedStyle(mainNav).position === 'sticky') offsetCalculation += mainNav.offsetHeight;
        if (promoMarquee && getComputedStyle(promoMarquee).position === 'sticky') offsetCalculation += promoMarquee.offsetHeight;


        sections.forEach(section => {
            const sectionTop = section.offsetTop - offsetCalculation;
            if (pageYOffset >= sectionTop) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        if (!currentSectionId && pageYOffset < window.innerHeight * 0.5 && document.getElementById('hero')) {
            currentSectionId = 'hero';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href) {
                const linkTargetId = href.includes('#') ? href.substring(href.indexOf('#') + 1) : null;
                if (linkTargetId && linkTargetId === currentSectionId) {
                    link.classList.add('active');
                } else if ((href === '/' || href === '/#hero') && currentSectionId === 'hero') {
                     link.classList.add('active');
                } else if (!href.includes('#') && window.location.pathname === href) {
                    link.classList.add('active');
                }
            }
        });
    }
    
    if (document.body.classList.contains('user-page')) {
        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink(); 
    }

    const acceptCookieButton = document.getElementById('acceptCookieButton');
    const cookieConsentBanner = document.getElementById('cookieConsentBanner');
    if (acceptCookieButton && cookieConsentBanner) {
        if (!document.cookie.split('; ').find(row => row.startsWith('cookie_consent=accepted'))) {
            cookieConsentBanner.style.display = 'flex';
        }
        acceptCookieButton.addEventListener('click', function () {
            fetch('/set-cookie-consent')
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Cookie consent set') {
                        cookieConsentBanner.style.display = 'none';
                    }
                })
                .catch(error => console.error('Error setting cookie consent:', error));
        });
    }

    const buyNowButtons = document.querySelectorAll('.buy-now-btn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeModalBtn = document.querySelector('#checkoutModal .close-modal-btn');
    const modalProductName = document.getElementById('modalProductName');
    const modalOriginalPrice = document.getElementById('modalOriginalPrice');
    const modalDiscountAmount = document.getElementById('modalDiscountAmount');
    const modalFinalPrice = document.getElementById('modalFinalPrice');
    const modalProductIdInput = document.getElementById('modalProductId');
    const promoCodeInput = document.getElementById('promoCodeInput');
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const promoMessageEl = document.getElementById('promoMessage');
    const proceedToPaymentBtn = document.getElementById('proceedToPaymentBtn');
    const modalAppliedPromoCodeInput = document.getElementById('modalAppliedPromoCode');

    let currentProductData = null;

    function formatCurrency(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return '0'; 
        }
        return amount.toLocaleString('id-ID');
    }

    function resetModal() {
        if(modalProductName) modalProductName.textContent = 'Nama Produk';
        if(modalOriginalPrice) modalOriginalPrice.textContent = formatCurrency(0);
        if(modalDiscountAmount) modalDiscountAmount.textContent = formatCurrency(0);
        if(modalFinalPrice) modalFinalPrice.textContent = formatCurrency(0);
        if(modalProductIdInput) modalProductIdInput.value = '';
        if(promoCodeInput) promoCodeInput.value = '';
        if(promoMessageEl) { promoMessageEl.textContent = ''; promoMessageEl.className = ''; }
        if(modalAppliedPromoCodeInput) modalAppliedPromoCodeInput.value = '';
        currentProductData = null;
    }
    
    function updatePriceDisplay(original, discount, final) {
        if(modalOriginalPrice) modalOriginalPrice.textContent = formatCurrency(original);
        if(modalDiscountAmount) modalDiscountAmount.textContent = formatCurrency(discount);
        if(modalFinalPrice) modalFinalPrice.textContent = formatCurrency(final);
    }

    if (buyNowButtons.length > 0 && checkoutModal) {
        buyNowButtons.forEach(button => {
            button.addEventListener('click', function () {
                resetModal();
                const productId = this.dataset.productId;
                
                fetch(`/api/product/${productId}`) 
                    .then(response => {
                        if (!response.ok) throw new Error('Produk tidak ditemukan atau error server');
                        return response.json();
                    })
                    .then(product => {
                        currentProductData = product;
                        if(modalProductName) modalProductName.textContent = product.name;
                        if(modalProductIdInput) modalProductIdInput.value = product.id;
                        updatePriceDisplay(Number(product.price) || 0, 0, Number(product.price) || 0);
                        checkoutModal.style.display = 'flex';
                    })
                    .catch(err => {
                        console.error("Error fetching product details:", err);
                        Swal.fire('Error', err.message || 'Gagal memuat detail produk.', 'error');
                    });
            });
        });

        if (closeModalBtn) {
            closeModalBtn.onclick = function () { checkoutModal.style.display = 'none'; }
        }

        window.onclick = function (event) {
            if (event.target == checkoutModal) { checkoutModal.style.display = 'none'; }
        }

        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', function() {
                const promoCodeVal = promoCodeInput.value.trim();
                const productIdVal = modalProductIdInput.value;

                if (!promoCodeVal) {
                    promoMessageEl.textContent = 'Masukkan kode promo.';
                    promoMessageEl.className = 'error'; return;
                }
                if (!currentProductData) {
                     promoMessageEl.textContent = 'Data produk tidak ditemukan.';
                     promoMessageEl.className = 'error'; return;
                }

                applyPromoBtn.disabled = true;
                applyPromoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menerapkan...';
                promoMessageEl.textContent = ''; promoMessageEl.className = '';

                fetch('/apply-promo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: productIdVal, promoCode: promoCodeVal })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(errData => { throw new Error(errData.error || `HTTP error! status: ${response.status}`); });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        promoMessageEl.textContent = data.message;
                        promoMessageEl.className = 'success';
                        updatePriceDisplay(Number(data.originalPrice) || 0, Number(data.discountAmount) || 0, Number(data.finalPrice) || 0);
                        if(modalAppliedPromoCodeInput) modalAppliedPromoCodeInput.value = data.appliedPromoCode;
                    } else {
                        promoMessageEl.textContent = data.error || 'Kode promo tidak dapat diterapkan.';
                        promoMessageEl.className = 'error';
                        const basePrice = currentProductData ? Number(currentProductData.price) : 0;
                        updatePriceDisplay(Number(data.originalPrice) || basePrice, Number(data.discountAmount) || 0, Number(data.finalPrice) || basePrice);
                        if(modalAppliedPromoCodeInput) modalAppliedPromoCodeInput.value = '';
                    }
                })
                .catch(err => {
                    console.error("Error applying promo:", err);
                    promoMessageEl.textContent = err.message || 'Terjadi kesalahan jaringan. Coba lagi.';
                    promoMessageEl.className = 'error';
                    const basePrice = currentProductData ? Number(currentProductData.price) : 0;
                    updatePriceDisplay(basePrice, 0, basePrice);
                    if(modalAppliedPromoCodeInput) modalAppliedPromoCodeInput.value = '';
                })
                .finally(() => {
                    applyPromoBtn.disabled = false;
                    applyPromoBtn.innerHTML = 'Terapkan';
                });
            });
        }
        
        if (promoCodeInput) {
            promoCodeInput.addEventListener('input', () => {
                if (promoMessageEl) { promoMessageEl.textContent = ''; promoMessageEl.className = ''; }
                if (currentProductData && modalAppliedPromoCodeInput && modalAppliedPromoCodeInput.value) { 
                    updatePriceDisplay(Number(currentProductData.price) || 0, 0, Number(currentProductData.price) || 0);
                    modalAppliedPromoCodeInput.value = '';
                }
            });
        }

        if (proceedToPaymentBtn) {
            proceedToPaymentBtn.addEventListener('click', function () {
                const productIdVal = modalProductIdInput.value;
                const appliedPromoVal = modalAppliedPromoCodeInput.value;
                
                proceedToPaymentBtn.disabled = true;
                proceedToPaymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

                fetch('/create-transaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: productIdVal, quantity: 1, appliedPromoCode: appliedPromoVal || null })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(errData => { throw new Error(errData.error || `Gagal membuat transaksi. Status: ${response.status}`); });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.token) {
                        if (checkoutModal) checkoutModal.style.display = 'none';
                        snap.pay(data.token, {
                            onSuccess: function (result) { window.location.href = `/payment-status?order_id=${result.order_id}&status=success&transaction_status=${result.transaction_status}&fraud_status=${result.fraud_status}`; },
                            onPending: function (result) { window.location.href = `/payment-status?order_id=${result.order_id}&status=pending&transaction_status=${result.transaction_status}&fraud_status=${result.fraud_status}`; },
                            onError: function (result) { window.location.href = `/payment-status?order_id=${result.order_id}&status=error&message=${encodeURIComponent(result.status_message || 'Payment failed')}`; },
                            onClose: function () {
                                Swal.fire({
                                    title: 'Pembayaran Dibatalkan',
                                    text: 'Anda menutup jendela pembayaran. Apakah Anda ingin mencoba lagi?',
                                    icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, coba lagi', cancelButtonText: 'Tidak'
                                }).then((res) => { if (res.isConfirmed && checkoutModal && currentProductData) checkoutModal.style.display = 'flex'; });
                            }
                        });
                    } else { 
                        Swal.fire('Error', data.error || 'Gagal membuat transaksi. Token tidak diterima.', 'error');
                    }
                })
                .catch(err => {
                    console.error("Error creating transaction:", err);
                    Swal.fire('Error', err.message || 'Terjadi kesalahan. Silakan coba lagi.', 'error');
                })
                .finally(() => {
                     proceedToPaymentBtn.disabled = false;
                     proceedToPaymentBtn.innerHTML = '<i class="fas fa-credit-card"></i> Lanjutkan ke Pembayaran';
                });
            });
        }
    }
});