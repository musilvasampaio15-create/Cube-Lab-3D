document.addEventListener('DOMContentLoaded', () => {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const allElements = document.querySelectorAll('.slider-wrapper iframe');
    const prevButton = document.querySelector('.slider-arrow.prev'); // Corrigido
    const nextButton = document.querySelector('.slider-arrow.next'); // Corrigido

    // ----- Infinite carousel using clones -----
    const gap = 10; // must match CSS
    let baseWidth = (allElements[0] && allElements[0].offsetWidth) ? allElements[0].offsetWidth : 350;
    let moveDistance = baseWidth + gap;

    let originals = Array.from(sliderWrapper.children); // the original iframes (may be NodeList)
    let total = originals.length;

    function buildCarousel() {
        // clear any existing clones
        sliderWrapper.innerHTML = '';

        // recompute sizes
        baseWidth = (originals[0] && originals[0].offsetWidth) ? originals[0].offsetWidth : 350;
        moveDistance = baseWidth + gap;


        // clone the full set on both sides (three repeats total) so visual wrap is hidden
        const clones = total; // full duplication to reduce visible wrapping frequency

        // prepend full clone
        for (let i = 0; i < clones; i++) {
            const idx = i;
            const node = originals[idx].cloneNode(true);
            node.dataset.originalIndex = idx;
            sliderWrapper.appendChild(node);
        }

        // append originals (middle set)
        originals.forEach((el, idx) => {
            const node = el.cloneNode(true);
            node.dataset.originalIndex = idx;
            sliderWrapper.appendChild(node);
        });

        // append full clone again (right)
        for (let i = 0; i < clones; i++) {
            const idx = i;
            const node = originals[idx].cloneNode(true);
            node.dataset.originalIndex = idx;
            sliderWrapper.appendChild(node);
        }

        // update list of slides
        const slides = Array.from(sliderWrapper.children);

        // set wrapper width
        sliderWrapper.style.width = `${slides.length * baseWidth + (slides.length - 1) * gap}px`;

        // store state
        state.clones = clones;
        state.slides = slides;
        state.currentLeft = clones; // leftmost visible index in slides array

        // position at initial
        sliderWrapper.style.transform = `translateX(${-state.currentLeft * moveDistance}px)`;
        updateHighlight();
    }

    function getSlidesPerView() {
        const containerW = document.querySelector('.slider-container').offsetWidth - 120; // account for padding
        const possible = Math.floor(containerW / (baseWidth + gap));
        return Math.min(4, Math.max(1, possible || 1));
    }

    const state = { clones: 0, slides: [], currentLeft: 0 };

    function updateHighlight() {
        // compute logical center index
        const centerOffset = Math.floor(getSlidesPerView() / 2);
        const logicalCenter = (state.currentLeft + centerOffset) % total;

        // remove active from all
        state.slides.forEach(s => s.classList.remove('active'));
        // add active to the slide(s) whose original index matches logicalCenter and that is currently centered
        // find the physical slide that's at visual center position
        const visualCenterIdx = state.currentLeft + centerOffset;
        const slide = state.slides[visualCenterIdx];
        if (slide) slide.classList.add('active');
    }

    function moveTo(leftIdx, animate = true) {
        const x = -leftIdx * moveDistance;
        if (!animate) {
            sliderWrapper.style.transition = 'none';
            sliderWrapper.style.transform = `translate3d(${x}px,0,0)`;
            // force reflow to apply immediate jump without animation
            sliderWrapper.getBoundingClientRect();
            state.currentLeft = leftIdx;
            return;
        }

        // ensure we animate on the next frame for smooth transitions
        sliderWrapper.style.transition = 'transform 0.32s ease-in-out';
        requestAnimationFrame(() => {
            sliderWrapper.style.transform = `translate3d(${x}px,0,0)`;
        });
        state.currentLeft = leftIdx;
    }

    function next() {
        moveTo(state.currentLeft + 1, true);
    }

    function prev() {
        moveTo(state.currentLeft - 1, true);
    }

    // handle wrap after transition — perform non-animated jump with forced reflow to avoid visible flicker
    sliderWrapper.addEventListener('transitionend', () => {
        // if we've moved into appended clones on the right
        if (state.currentLeft >= total + state.clones) {
            const newLeft = state.currentLeft - total;
            // disable transition, jump, force reflow, then clear transition so future anims work
            sliderWrapper.style.transition = 'none';
            sliderWrapper.style.transform = `translate3d(${-newLeft * moveDistance}px,0,0)`;
            sliderWrapper.getBoundingClientRect();
            // ensure we don't re-enable transition mid-frame
            requestAnimationFrame(() => { sliderWrapper.style.transition = ''; });
            state.currentLeft = newLeft;
        }
        // if we've moved into prepended clones on the left
        if (state.currentLeft < state.clones) {
            const newLeft = state.currentLeft + total;
            sliderWrapper.style.transition = 'none';
            sliderWrapper.style.transform = `translate3d(${-newLeft * moveDistance}px,0,0)`;
            sliderWrapper.getBoundingClientRect();
            requestAnimationFrame(() => { sliderWrapper.style.transition = ''; });
            state.currentLeft = newLeft;
        }
        updateHighlight();
    });

    // Corrigido: Verificar se os botões existem antes de adicionar event listeners
    if (nextButton) {
        nextButton.addEventListener('click', next);
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', prev);
    }

    // initial build
    originals = Array.from(document.querySelectorAll('.slider-wrapper iframe'));
    total = originals.length;
    buildCarousel();

    // REMOVER ou COMENTAR esta seção - As setas agora são posicionadas pelo CSS
    // Position nav buttons vertically to align with the slider's visual center
    // const sliderContainer = document.querySelector('.slider-container');

    // function positionButtonsImmediate() {
    //     if (!sliderContainer) return;
    //     const rect = sliderContainer.getBoundingClientRect();
    //     const centerY = rect.top + (rect.height / 2);
    //     // set top relative to viewport; keep translateY(-50%) in CSS
    //     if (prevButton) prevButton.style.top = `${centerY}px`;
    //     if (nextButton) nextButton.style.top = `${centerY}px`;
    // }

    // function positionButtonsDebounced() {
    //     clearTimeout(window._buttonPosTimer);
    //     window._buttonPosTimer = setTimeout(() => {
    //         requestAnimationFrame(positionButtonsImmediate);
    //     }, 60);
    // }

    // // initial position
    // positionButtonsImmediate();

    // // update position after rebuild or viewport changes
    // window.addEventListener('resize', () => {
    //     positionButtonsDebounced();
    // });
    // window.addEventListener('scroll', () => {
    //     positionButtonsDebounced();
    // }, { passive: true });

    // rebuild on resize (debounced)
    window.addEventListener('resize', () => {
        clearTimeout(window._carouselResizeTimer);
        window._carouselResizeTimer = setTimeout(() => {
            originals = Array.from(document.querySelectorAll('.slider-wrapper iframe'));
            total = originals.length;
            baseWidth = (originals[0] && originals[0].offsetWidth) ? originals[0].offsetWidth : baseWidth;
            moveDistance = baseWidth + gap;
            buildCarousel();
        }, 160);
    });

    // --- Sticky nav / show full header at top ---
    const siteHeader = document.getElementById('site-header');
    const siteNav = document.getElementById('site-nav');

    function handleScroll() {
        const scY = window.scrollY || window.pageYOffset;

        if (scY > 0) {
            siteNav.classList.add('fixed-nav');
            siteHeader.classList.add('header--collapsed');
            // prevent content jump when nav becomes fixed
            document.body.style.paddingTop = `${siteNav.offsetHeight}px`;
        } else {
            siteNav.classList.remove('fixed-nav');
            siteHeader.classList.remove('header--collapsed');
            document.body.style.paddingTop = '';
        }
    }

    if (siteHeader && siteNav) {
        window.addEventListener('scroll', handleScroll, { passive: true });
        // initialize on load
        handleScroll();
    }

    // --- Hero modal: show iframe overlay when clicking anywhere in hero ---
    const heroMain = document.querySelector('.home-main');
    const sourceIframe = document.querySelector('.hero__visualizador');

    // create modal elements
    const modal = document.createElement('div');
    modal.className = 'hero-modal';

    modal.innerHTML = `
        <div class="hero-modal-backdrop" tabindex="-1"></div>
        <div class="hero-modal-content" role="dialog" aria-modal="true">
            <button class="hero-modal-close" aria-label="Fechar">×</button>
            <div class="hero-modal-iframe-wrap"></div>
        </div>
    `;

    document.body.appendChild(modal);

    const iframeWrap = modal.querySelector('.hero-modal-iframe-wrap');
    const closeBtn = modal.querySelector('.hero-modal-close');
    const backdrop = modal.querySelector('.hero-modal-backdrop');

    function openHeroModal() {
        // if original iframe exists, clone it; otherwise build a new one from src
        let iframeToUse = null;
        if (sourceIframe) {
            iframeToUse = sourceIframe.cloneNode(true);
            // ensure autoplay when opened
            try { iframeToUse.removeAttribute('loading'); } catch(e){}
        } else {
            iframeToUse = document.createElement('iframe');
            iframeToUse.src = 'https://sketchfab.com/models/c859237754d24d35b0699ccf9d297224/embed?autostart=1&camera=0&transparent=1&ui_theme=dark';
        }

        // clear previous and append
        iframeWrap.innerHTML = '';
        iframeWrap.appendChild(iframeToUse);

        modal.classList.add('open');
        // lock scroll
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        // focus close button for accessibility
        closeBtn.focus();
    }

    function closeHeroModal() {
        modal.classList.remove('open');
        // restore scroll
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        // remove iframe to stop playback
        iframeWrap.innerHTML = '';
    }

    // open when clicking the hero button
    const heroButton = document.getElementById('hero-button');
    if (heroButton) {
        heroButton.addEventListener('click', openHeroModal);
    }

    // close handlers
    closeBtn.addEventListener('click', closeHeroModal);
    backdrop.addEventListener('click', closeHeroModal);

    // ESC to close
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeHeroModal();
        }
    });
});