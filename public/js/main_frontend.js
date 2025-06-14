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
    const sidebarInternalMenuToggle = document.getElementById('sidebarMenuToggle');
    const overlay = document.getElementById('overlay');
    const body = document.body;

    function commonToggleSidebarActions() {
        if (sidebar) sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
        if (body) body.classList.toggle('sidebar-open');
        
        const isOpen = sidebar ? sidebar.classList.contains('open') : false;

        if (mainHeaderMenuToggle) {
            const icon = mainHeaderMenuToggle.querySelector('i');
            if (icon) {
                icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
            }
        }
        if (sidebarInternalMenuToggle) {
             const icon = sidebarInternalMenuToggle.querySelector('i');
             if (icon) {
                icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
             }
        }
        
        fetch('/toggle-sidebar-cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ isOpen: isOpen })
        }).catch(err => console.error('Error saving sidebar state:', err));
    }
    
    if (mainHeaderMenuToggle) {
        mainHeaderMenuToggle.addEventListener('click', commonToggleSidebarActions);
    }
    if (sidebarInternalMenuToggle) {
        sidebarInternalMenuToggle.addEventListener('click', commonToggleSidebarActions);
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            if (sidebar && sidebar.classList.contains('open')) {
                commonToggleSidebarActions();
            }
        });
    }

    document.querySelectorAll('.sidebar-nav a[href^="/#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (window.location.pathname === '/' && this.getAttribute('href').startsWith('/#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(2);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    let offset = 0;
                    const mainHeaderNav = document.querySelector('.main-header-nav');
                    const promoMarquee = document.querySelector('.promo-marquee-banner');
                    if (mainHeaderNav && getComputedStyle(mainHeaderNav).position === 'sticky') {
                        offset += mainHeaderNav.offsetHeight;
                    }
                    if (promoMarquee && getComputedStyle(promoMarquee).position === 'sticky') {
                        offset += promoMarquee.offsetHeight;
                    }
                    
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
                if (sidebar && sidebar.classList.contains('open') && window.innerWidth <= 768) {
                    commonToggleSidebarActions();
                }
            } else if (this.getAttribute('href').startsWith('/#')) {
                 window.location.href = '/' + this.getAttribute('href').substring(1);
            }
        });
    });

    const navLinks = document.querySelectorAll('.main-header-nav a, .sidebar-nav a');
    function updateActiveLink() {
        let currentSectionId = '';
        const sections = document.querySelectorAll('.content-section');
        const offset = window.innerHeight * 0.4; 

        sections.forEach(section => {
            const sectionTop = section.offsetTop - offset;
            const sectionHeight = section.offsetHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        if (pageYOffset < window.innerHeight * 0.5 && document.getElementById('hero')) {
            currentSectionId = 'hero';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href) {
                if (href.includes(currentSectionId) && currentSectionId !== '') {
                    link.classList.add('active');
                } else if ((href === '/' || href === '/#hero') && currentSectionId === 'hero') {
                     link.classList.add('active');
                } else if (window.location.pathname === href && !href.includes('#')) {
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
        if (!document.cookie.split('; ').find(row => row.startsWith('cookie_consent='))) {
             if(cookieConsentBanner) cookieConsentBanner.style.display = 'flex';
        }
        acceptCookieButton.addEventListener('click', function () {
            fetch('/set-cookie-consent')
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Cookie consent set') {
                        if(cookieConsentBanner) cookieConsentBanner.style.display = 'none';
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
        return amount.toLocaleString('id-ID');
    }

    function resetModal() {
        if(modalProductName) modalProductName.textContent = 'Nama Produk';
        if(modalOriginalPrice) modalOriginalPrice.textContent = '0';
        if(modalDiscountAmount) modalDiscountAmount.textContent = '0';
        if(modalFinalPrice) modalFinalPrice.textContent = '0';
        if(modalProductIdInput) modalProductIdInput.value = '';
        if(promoCodeInput) promoCodeInput.value = '';
        if(promoMessageEl) {
            promoMessageEl.textContent = '';
            promoMessageEl.className = '';
        }
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
                        if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        return response.json();
                    })
                    .then(product => {
                        currentProductData = product;
                        if(modalProductName) modalProductName.textContent = product.name;
                        if(modalProductIdInput) modalProductIdInput.value = product.id;
                        updatePriceDisplay(product.price, 0, product.price);
                        checkoutModal.style.display = 'flex';
                    })
                    .catch(err => {
                        console.error("Error fetching product details:", err);
                        Swal.fire('Error', 'Gagal memuat detail produk. Produk mungkin tidak ditemukan.', 'error');
                    });
            });
        });

        if (closeModalBtn) {
            closeModalBtn.onclick = function () {
                if(checkoutModal) checkoutModal.style.display = 'none';
            }
        }

        if(checkoutModal) {
            checkoutModal.addEventListener('click', function(event){
                if (event.target == checkoutModal) {
                     checkoutModal.style.display = 'none';
                }
            });
        }
        

        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', function() {
                const promoCode = promoCodeInput.value.trim();
                const productId = modalProductIdInput.value;

                if (!promoCode) {
                    if(promoMessageEl) {promoMessageEl.textContent = 'Masukkan kode promo.'; promoMessageEl.className = 'error';}
                    return;
                }
                if (!currentProductData) {
                     if(promoMessageEl) {promoMessageEl.textContent = 'Data produk tidak ditemukan.'; promoMessageEl.className = 'error';}
                     return;
                }

                applyPromoBtn.disabled = true;
                applyPromoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                fetch('/apply-promo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: productId, promoCode: promoCode })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        if(promoMessageEl) {promoMessageEl.textContent = data.message; promoMessageEl.className = 'success';}
                        updatePriceDisplay(data.originalPrice, data.discountAmount, data.finalPrice);
                        if(modalAppliedPromoCodeInput) modalAppliedPromoCodeInput.value = data.appliedPromoCode;
                    } else {
                        if(promoMessageEl) {promoMessageEl.textContent = data.error || 'Kode promo tidak valid.'; promoMessageEl.className = 'error';}
                        updatePriceDisplay(data.originalPrice || currentProductData.price, data.discountAmount || 0, data.finalPrice || currentProductData.price);
                        if(modalAppliedPromoCodeInput) modalAppliedPromoCodeInput.value = '';
                    }
                })
                .catch(err => {
                    console.error("Error applying promo:", err);
                    if(promoMessageEl) {promoMessageEl.textContent = 'Terjadi kesalahan. Coba lagi.'; promoMessageEl.className = 'error';}
                    updatePriceDisplay(currentProductData.price, 0, currentProductData.price);
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
                if (promoMessageEl) {
                    promoMessageEl.textContent = '';
                    promoMessageEl.className = '';
                }
                if (currentProductData && modalAppliedPromoCodeInput && modalAppliedPromoCodeInput.value) { 
                    updatePriceDisplay(currentProductData.price, 0, currentProductData.price);
                    modalAppliedPromoCodeInput.value = '';
                }
            });
        }

        if (proceedToPaymentBtn) {
            proceedToPaymentBtn.addEventListener('click', function () {
                const productId = modalProductIdInput.value;
                const appliedPromo = modalAppliedPromoCodeInput.value;
                
                proceedToPaymentBtn.disabled = true;
                proceedToPaymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

                fetch('/create-transaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        productId: productId, 
                        quantity: 1,
                        appliedPromoCode: appliedPromo || null
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.token) {
                        if (checkoutModal) checkoutModal.style.display = 'none';
                        snap.pay(data.token, {
                            onSuccess: function (result) {
                                window.location.href = `/payment-status?order_id=${result.order_id}&status=success&transaction_status=${result.transaction_status}&fraud_status=${result.fraud_status}`;
                            },
                            onPending: function (result) {
                                window.location.href = `/payment-status?order_id=${result.order_id}&status=pending&transaction_status=${result.transaction_status}&fraud_status=${result.fraud_status}`;
                            },
                            onError: function (result) {
                                window.location.href = `/payment-status?order_id=${result.order_id || 'error_no_order_id'}&status=error&message=${encodeURIComponent(result.status_message || (result.error_messages ? result.error_messages.join(', ') : 'Payment failed'))}`;
                            },
                            onClose: function () {
                                Swal.fire({
                                    title: 'Pembayaran Dibatalkan',
                                    text: 'Anda menutup jendela pembayaran. Apakah Anda ingin mencoba lagi?',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonText: 'Ya, coba lagi',
                                    cancelButtonText: 'Tidak'
                                }).then((result) => {
                                    if (result.isConfirmed && checkoutModal) {
                                       if(currentProductData) checkoutModal.style.display = 'flex';
                                    }
                                });
                            }
                        });
                    } else {
                        Swal.fire('Error', data.error || 'Gagal membuat transaksi.', 'error');
                    }
                })
                .catch(err => {
                    console.error("Error creating transaction:", err);
                    Swal.fire('Error', 'Terjadi kesalahan. Silakan coba lagi.', 'error');
                })
                .finally(() => {
                     proceedToPaymentBtn.disabled = false;
                     proceedToPaymentBtn.innerHTML = '<i class="fas fa-credit-card"></i> Lanjutkan ke Pembayaran';
                });
            });
        }
    }
});