document.addEventListener("DOMContentLoaded", () => {

    /* ===== Loading Screen ===== */
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                initParticles();
                initTabIndicator();
            }, 800); // Small delay to let animations sync perfectly
        });
    }

    /* ===== Particles Background ===== */
    const particlesContainer = document.getElementById('particles-container');
    const particleCount = 50;

    function initParticles() {
        if (!particlesContainer) return;
        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }
    }

    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Randomize properties
        const size = Math.random() * 3 + 1;
        const xPos = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 10 + 5;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${xPos}vw`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;

        const colors = ['var(--neon-cyan)', 'var(--neon-pink)', 'var(--neon-purple)'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        particlesContainer.appendChild(particle);

        // Remove and recreate when animation basically ends (re-using elements is better, but this is fine given the keyframes)
        setTimeout(() => {
            particle.remove();
            createParticle();
        }, (duration + delay) * 1000);
    }

    /* ===== Tab Sliding Indicator & Filtering ===== */
    const tabs = document.querySelectorAll('.tab');
    const indicator = document.querySelector('.tab-indicator');
    const movieCards = document.querySelectorAll('.movie-card');
    const noResults = document.getElementById('no-results');

    function initTabIndicator() {
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) updateIndicator(activeTab);
    }

    function updateIndicator(tab) {
        indicator.style.width = `${tab.offsetWidth}px`;
        indicator.style.left = `${tab.offsetLeft}px`;
    }

    /* Window resize listener to keep indicator positioned */
    window.addEventListener('resize', () => {
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            indicator.style.transition = 'none';
            updateIndicator(activeTab);
            setTimeout(() => { indicator.style.transition = ''; }, 50);
        }
    });

    // JS tab click handling removed because tabs are now standard native multi-page links

    /* ===== Search & Filtering System ===== */
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterMovies();
        });
    }

    function filterMovies() {
        const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let visibleCount = 0;

        movieCards.forEach(card => {
            const title = card.dataset.title ? card.dataset.title.toLowerCase() : '';
            const searchMatch = title.includes(searchQuery);

            if (searchMatch) {
                card.classList.remove('hide');
                card.classList.remove('hidden'); // Fallback purely hidden class if animations removed
                card.classList.add('show');
                visibleCount++;
            } else {
                card.classList.remove('show');
                card.classList.add('hide');

                // Hide fully after animation to free up layout space
                setTimeout(() => {
                    if (card.classList.contains('hide')) {
                        card.classList.add('hidden');
                    }
                }, 300);
            }
        });

        // Show/Hide Empty State
        if (noResults) {
            if (visibleCount === 0) {
                setTimeout(() => {
                    noResults.classList.remove('hidden');
                }, 300); // Show after fade out
            } else {
                noResults.classList.add('hidden');
            }
        }
    }

    /* ===== Infinite Auto-Scrolling Slider ===== */
    const sliderContainer = document.getElementById('trending-slider');

    if (sliderContainer) {
        // Create the track element dynamically
        const track = document.createElement('div');
        track.classList.add('slider-track');

        // Check if track already exists (defensive programming if user manually added it)
        const existingTrack = sliderContainer.querySelector('.slider-track');
        if (existingTrack) {
            // User already has the track wrapper
        } else {
            // Move all existing cards into the track
            const originalCards = Array.from(sliderContainer.querySelectorAll('.slider-card'));

            // Only proceed if there are cards
            if (originalCards.length > 0) {
                originalCards.forEach(card => track.appendChild(card));

                // Clone cards for infinite loop
                originalCards.forEach(card => {
                    const clone = card.cloneNode(true);
                    // Add attribute to identify clones if we need it later
                    clone.setAttribute('data-clone', 'true');
                    track.appendChild(clone);
                });

                // Append track to container
                sliderContainer.appendChild(track);
                sliderContainer.classList.add('auto-scroll');

                // Auto-scroll logic using requestAnimationFrame
                let scrollPos = 0;
                let isHovered = false;
                let animationId;

                function scrollSlider() {
                    if (!isHovered) {
                        scrollPos += 1; // adjust speed (pixels per frame)

                        // Calculate jump distance dynamically (distance from first original to first clone)
                        const firstCard = track.children[0];
                        const firstClone = track.children[originalCards.length];

                        if (firstCard && firstClone) {
                            const jumpDistance = firstClone.offsetLeft - firstCard.offsetLeft;

                            if (scrollPos >= jumpDistance) {
                                // Seamless reset
                                scrollPos -= jumpDistance;
                            }
                        }

                        // Apply transform hardware accelerated
                        track.style.transform = `translate3d(${-scrollPos}px, 0, 0)`;
                    }
                    animationId = requestAnimationFrame(scrollSlider);
                }

                // Hover listeners
                sliderContainer.addEventListener('mouseenter', () => isHovered = true);
                sliderContainer.addEventListener('mouseleave', () => isHovered = false);

                // Touch listeners for mobile
                sliderContainer.addEventListener('touchstart', () => isHovered = true, { passive: true });
                sliderContainer.addEventListener('touchend', () => isHovered = false);

                // Start animation
                animationId = requestAnimationFrame(scrollSlider);
            }
        }
    }

    /* ===== 3D Tilt Effect ===== */
    movieCards.forEach(card => {
        const inner = card.querySelector('.card-inner');
        const targetElement = inner || card;

        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = inner ? (((y - centerY) / centerY) * -10) : (-(y - centerY) / 10);
            const rotateY = inner ? (((x - centerX) / centerX) * 10) : ((x - centerX) / 10);
            const scale = inner ? '' : ' scale(1.08)';

            targetElement.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)${scale}`;
            targetElement.style.transition = 'none';
        });

        card.addEventListener('mouseleave', () => {
            targetElement.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
            targetElement.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });

    // Alternate Nav Filtering removed

    /* ===== Ripple Effect on Buttons ===== */
    const ripples = document.querySelectorAll('.ripple');

    ripples.forEach(button => {
        button.addEventListener('click', function (e) {
            if (e.target.closest('[data-preview]')) {
                // Only for bubbling issues if nested
            }

            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rippleSpan = document.createElement('span');
            rippleSpan.classList.add('ripple-span');
            rippleSpan.style.left = `${x}px`;
            rippleSpan.style.top = `${y}px`;

            // Calculate size based on button dimensions
            const size = Math.max(rect.width, rect.height);
            rippleSpan.style.width = rippleSpan.style.height = `${size}px`;

            // Center the span explicitly since transform-origin is 0 0 by default for absolute
            rippleSpan.style.transform = 'translate(-50%, -50%) scale(0)';

            button.appendChild(rippleSpan);

            setTimeout(() => {
                rippleSpan.remove();
            }, 600);
        });
    });

    /* ===== Modal preview ===== */
    const modal = document.getElementById('preview-modal');
    const modalImg = document.getElementById('modal-img');
    const modalVideo = document.getElementById('modal-video');
    const modalPlayBtn = document.getElementById('modal-play-btn');
    const modalTitle = document.getElementById('modal-title');
    const closeBtn = document.querySelector('.close-modal');
    const previewButtons = document.querySelectorAll('[data-preview]');

    previewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.movie-card');
            const title = card.dataset.title;
            const imgSrc = card.querySelector('img').src;
            const videoSrc = btn.dataset.video;

            modalTitle.textContent = title;

            if (videoSrc && videoSrc.trim() !== "") {
                // Show iframe video
                if (modalVideo) {
                    modalVideo.src = videoSrc;
                    modalVideo.classList.remove('hidden');
                }
                modalImg.classList.add('hidden');
                if (modalPlayBtn) modalPlayBtn.classList.add('hidden');
            } else {
                // Show image
                modalImg.src = imgSrc;
                modalImg.classList.remove('hidden');
                if (modalVideo) {
                    modalVideo.src = "";
                    modalVideo.classList.add('hidden');
                }
                if (modalPlayBtn) modalPlayBtn.classList.remove('hidden');
            }

            modal.classList.add('active');
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        });
    });

    // Enhanced generic modal closing
    const closeBtns = document.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const openModal = document.querySelector('.modal-overlay.active');
            if (openModal) closeSpecificModal(openModal);
        });
    });

    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeSpecificModal(overlay);
        });
    });

    function closeSpecificModal(m) {
        m.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scroll

        // Stop video playback when closing preview modal specifically
        if (m.id === 'preview-modal') {
            setTimeout(() => {
                const mV = document.getElementById('modal-video');
                if (mV && !mV.classList.contains('hidden')) {
                    mV.src = "";
                }
            }, 300); // clear src after fade out animation
        }
    }

    // Escape key to close any active modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) closeSpecificModal(activeModal);
        }
    });

    /* ===== Dual-Tab Download System ===== */
    const downloadBtns = document.querySelectorAll('.btn-download');
    const downloadModal = document.getElementById('download-modal');
    const continueBtn = document.getElementById('continue-download-btn');

    let activeDownloadUrl = "";

    downloadBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const downloadLink = btn.dataset.download;

            // Validate link
            if (!downloadLink || downloadLink === "#" || downloadLink === "") {
                alert("Download link not available");
                return;
            }

            activeDownloadUrl = downloadLink;

            const originalText = btn.innerHTML;
            btn.innerHTML = 'Opening...';

            // 1. Open Youtube promotional link safely
            window.open("https://shorturl.at/0Brs8", "_blank", "noopener,noreferrer");

            // 2. Open Download Gateway Modal
            if (downloadModal) {
                downloadModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            // Restore button text after short delay
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 800);
        });
    });

    // Fallback using Event Delegation for the Continue Button
    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('#continue-download-btn');
        if (targetBtn) {
            e.preventDefault();

            console.log("Download URL:", activeDownloadUrl);

            if (!activeDownloadUrl) {
                alert("Download link not available");
                return;
            }

            // Open safe link
            window.open(activeDownloadUrl, "_blank", "noopener,noreferrer");

            // Close modal properly
            if (downloadModal) {
                closeSpecificModal(downloadModal);
            }

            // Reset state
            activeDownloadUrl = "";
        }
    });

    /* ===== Dynamic Footer Navigation ===== */
    const exploreLinks = document.querySelectorAll('.footer-link-explore');
    const categoryLinks = document.querySelectorAll('.footer-link-category');
    const legalLinks = document.querySelectorAll('.footer-link-legal');

    const mainSection = document.querySelector('main');
    const dynamicSection = document.getElementById('dynamic-page-section');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const dynamicTitle = document.getElementById('dynamic-title');
    const dynamicBody = document.getElementById('dynamic-body');

    // Content mapping for legal pages
    const legalContent = {
        terms: {
            title: "Terms of Service",
            body: `
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and using Raviya Developer Movies Hunter, you accept and agree to be bound by the terms and provision of this agreement. Our universe is open to all, provided these terms are respected.</p>
                <h3>2. Usage License</h3>
                <p>Permission is globally granted to temporarily access and view the materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
                <h3>3. Disclaimer</h3>
                <p>The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, regarding the cinematic data streams.</p>
            `
        },
        privacy: {
            title: "Privacy Policy",
            body: `
                <h3>Your Privacy Matters</h3>
                <p>We believe in full transparency regarding our data collection and usage practices across the galaxy.</p>
                <h3>Information We Collect</h3>
                <ul>
                    <li>Usage data (time spent on site, movies watched)</li>
                    <li>Device and browser information</li>
                </ul>
                <h3>How We Use It</h3>
                <p>We strictly use your data to improve our cinematic universe algorithms and provide better movie recommendations. Your data is never sold to third-party ad networks.</p>
            `
        },
        dmca: {
            title: "DMCA Notice",
            body: `
                <h3>Copyright Infringement</h3>
                <p>We respect the intellectual property of others. If you believe your work has been copied in a way that constitutes copyright infringement, please provide our Copyright Agent with the written information specified below.</p>
                <ul>
                    <li>An electronic or physical signature of the person authorized to act on behalf of the owner of the copyright interest.</li>
                    <li>A description of the copyrighted work that you claim has been infringed.</li>
                    <li>A description of where the material that you claim is infringing is located on the site.</li>
                </ul>
            `
        },
        contact: {
            title: "Contact Us",
            body: `
                <h3>Get In Touch</h3>
                <p>We're always looking for feedback on how to improve the Raviya Movies Hunter universe. Whether you have bug reports, feature requests, or business inquiries, reach out to us!</p>
                <p><strong>Email:</strong> thecryptomarket0@gmail.com</p>
                <p><strong>Transmission Channel:</strong> Sector 7G, Cyber City, Earth.</p>
            `
        }
    };

    // 1. Explore Links (Scroll)
    exploreLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            restoreMainView();

            const target = link.dataset.scroll;
            if (target === 'top') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (target === 'trending-slider') {
                const slider = document.querySelector('.slider-section');
                if (slider) slider.scrollIntoView({ behavior: 'smooth' });
            } else if (target === 'movies-grid') {
                const grid = document.querySelector('.grid-section');
                if (grid) grid.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 2. Category Links are now standard href paths handled natively rather than by JS routing.

    // 3. Legal Links (Dynamic Page Section)
    legalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;

            if (legalContent[pageId]) {
                // Populate content
                dynamicTitle.textContent = legalContent[pageId].title;
                dynamicBody.innerHTML = legalContent[pageId].body;

                // Hide main, show dynamic
                mainSection.classList.add('hidden');
                dynamicSection.classList.remove('hidden');

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // 4. Back Button Logic
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            restoreMainView();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function restoreMainView() {
        if (!dynamicSection.classList.contains('hidden')) {
            dynamicSection.classList.add('hidden');
            mainSection.classList.remove('hidden');

            // Add a small trigger animation so it doesn't just block-appear
            mainSection.style.animation = 'none';
            void mainSection.offsetWidth; // trigger reflow
            mainSection.style.animation = 'fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        }
    }

    /* ===== Security & Anti-Copy Features ===== */
    
    // Disable Right Click (Context Menu)
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // Disable Keyboard Shortcuts
    document.addEventListener('keydown', function (e) {
        // Prevent F12
        if (e.key === 'F12') {
            e.preventDefault();
        }
        
        // Prevent Ctrl+Shift+I (or Cmd+Option+I on Mac)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
            e.preventDefault();
        }
        
        // Prevent Ctrl+Shift+J (or Cmd+Option+J on Mac)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
        }
        
        // Prevent Ctrl+U (or Cmd+U on Mac) - View Source
        if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
        }
        
        // Prevent Ctrl+C and Ctrl+V (or Cmd+C and Cmd+V on Mac)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c' || e.key === 'V' || e.key === 'v')) {
            e.preventDefault();
        }
    });

    // Prevent Dragging Images
    document.addEventListener('dragstart', function(e) {
        if (e.target.nodeName === 'IMG') {
            e.preventDefault();
        }
    });

});
