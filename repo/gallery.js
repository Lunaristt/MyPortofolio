(function () {
    const stackPhotos = document.querySelectorAll('.stack-photo');
    const images = document.querySelectorAll('.stack-photo img');

    const lightbox = document.getElementById('galleryLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');

    let current = 0;
    const total = images.length;

    // Click a photo to open lightbox
    stackPhotos.forEach((photo, i) => {
        photo.addEventListener('click', () => {
            current = i;
            openLightbox();
        });
    });

    function openLightbox() {
        lightboxImg.src = images[current].src;
        lightboxCounter.textContent = (current + 1) + ' / ' + total;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    function lightboxNav(dir) {
        current = (current + dir + total) % total;
        lightboxImg.src = images[current].src;
        lightboxCounter.textContent = (current + 1) + ' / ' + total;
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); lightboxNav(-1); });
    lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); lightboxNav(1); });
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('open')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lightboxNav(-1);
            if (e.key === 'ArrowRight') lightboxNav(1);
        }
    });
})();
