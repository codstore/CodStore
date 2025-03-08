function scrollProducts(slider, direction) {
    const products = slider.querySelectorAll('.product');
    const productCount = products.length;
    if (productCount === 0) return;

    // Hitung lebar produk termasuk margin
    const productStyle = window.getComputedStyle(products[0]);
    const productWidth = products[0].offsetWidth + 
                        parseInt(productStyle.marginLeft) + 
                        parseInt(productStyle.marginRight);

    let currentIndex = parseInt(slider.getAttribute('data-current-index')) || 0;
    
    // Update active class
    products.forEach(p => p.classList.remove('active'));
    
    currentIndex = Math.max(0, Math.min(currentIndex + direction, productCount - 1));
    
    slider.style.transform = `translateX(${-currentIndex * productWidth}px)`;
    slider.setAttribute('data-current-index', currentIndex);
    
    // Add active class to current product
    if (products[currentIndex]) {
        products[currentIndex].classList.add('active');
    }
}

function addSwipeToSliders() {
    const sliders = document.querySelectorAll('.products');

    sliders.forEach(slider => {
        let startX = 0;
        let isSwiping = false;
        let rafId = null;
        let currentIndex = 0;
        const products = slider.querySelectorAll('.product');
        const productCount = products.length;

        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
            currentIndex = parseInt(slider.getAttribute('data-current-index')) || 0;
        };

        const handleTouchMove = (e) => {
            if (!isSwiping) return;
            
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const currentX = e.touches[0].clientX;
                const diffX = startX - currentX;
                const productStyle = window.getComputedStyle(products[0]);
                const productWidth = products[0].offsetWidth + 
                                   parseInt(productStyle.marginLeft) + 
                                   parseInt(productStyle.marginRight);

                // Batasi pergeseran maksimal
                const maxOffset = -((productCount - 1) * productWidth);
                const newOffset = Math.min(
                    Math.max(-currentIndex * productWidth - diffX, maxOffset),
                    0
                );
                
                slider.style.transform = `translateX(${newOffset}px)`;
            });
        };

        const handleTouchEnd = (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            const productStyle = window.getComputedStyle(products[0]);
            const productWidth = products[0].offsetWidth + 
                               parseInt(productStyle.marginLeft) + 
                               parseInt(productStyle.marginRight);

            if (Math.abs(diffX) > productWidth * 0.2) { // 20% of product width
                const direction = diffX > 0 ? 1 : -1;
                scrollProducts(slider, direction);
            } else {
                slider.style.transform = `translateX(${-currentIndex * productWidth}px)`;
            }

            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };

        // Initialize slider
        slider.setAttribute('data-current-index', '0');
        slider.style.transform = 'translateX(0)';
        if (products[0]) products[0].classList.add('active');

        // Event listeners
        slider.addEventListener('touchstart', handleTouchStart, { passive: true });
        slider.addEventListener('touchmove', handleTouchMove, { passive: false });
        slider.addEventListener('touchend', handleTouchEnd);
        slider.addEventListener('touchcancel', handleTouchEnd);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    addSwipeToSliders();
    
    // Reset on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            document.querySelectorAll('.products').forEach(slider => {
                slider.style.transform = 'translateX(0)';
                slider.setAttribute('data-current-index', '0');
                const firstProduct = slider.querySelector('.product');
                if (firstProduct) firstProduct.classList.add('active');
            });
        }, 250);
    });
});