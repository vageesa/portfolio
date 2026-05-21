document.addEventListener('DOMContentLoaded', () => {
    // --- Hero Subtext Word Bulge Effect ---
    const heroSub = document.querySelector('.hero-sub p');
    if (heroSub) {
        const text = heroSub.textContent;
        heroSub.innerHTML = text.split(' ').map(word => `<span class="hover-word">${word}</span>`).join(' ');
    }

    // --- Custom Cursor ---
    const cursor = document.querySelector('.custom-cursor');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    const links = document.querySelectorAll('a, button');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
        });
        link.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });

    // --- Fading Theme Transition ---
    const modeToggle = document.getElementById('mode-toggle');
    
    // Select the existing page transition overlay
    const transitionOverlay = document.getElementById('transition-overlay');

    // Fade out overlay on page load
    requestAnimationFrame(() => {
        const lastX = localStorage.getItem('transitionX');
        const lastY = localStorage.getItem('transitionY');
        
        if (lastX && lastY) {
            transitionOverlay.style.setProperty('--origin-x', lastX + 'px');
            transitionOverlay.style.setProperty('--origin-y', lastY + 'px');
        } else if (modeToggle) {
            const rect = modeToggle.getBoundingClientRect();
            transitionOverlay.style.setProperty('--origin-x', (rect.left + rect.width / 2) + 'px');
            transitionOverlay.style.setProperty('--origin-y', (rect.top + rect.height / 2) + 'px');
        }

        setTimeout(() => {
            transitionOverlay.classList.add('fade-out');
        }, 50);
    });

    modeToggle.addEventListener('click', () => {
        const isHobby = document.body.classList.contains('hobby-mode');
        
        // Get precise button position
        const rect = modeToggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        // Store for next page load
        localStorage.setItem('transitionX', x);
        localStorage.setItem('transitionY', y);
        
        // Disable transition for an instant reset
        transitionOverlay.style.transition = 'none';
        transitionOverlay.classList.add('circle-collapse');
        transitionOverlay.classList.remove('fade-out');
        transitionOverlay.style.backgroundColor = isHobby ? '#F5F5F2' : '#0a0a0c';
        transitionOverlay.style.setProperty('--origin-x', x + 'px');
        transitionOverlay.style.setProperty('--origin-y', y + 'px');
        
        // Force reflow
        void transitionOverlay.offsetWidth;
        
        // Re-enable transition and expand
        transitionOverlay.style.transition = '';
        transitionOverlay.classList.remove('circle-collapse');
        
        // Navigate after expansion completes
        setTimeout(() => {
            if (isHobby) {
                window.location.href = 'index.html';
            } else {
                window.location.href = 'hobby.html';
            }
        }, 1200);
    });

    // --- Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once revealed
                // revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Watermark Typography (Scroll Zoom/Fade) ---
    const watermark = document.getElementById('hero-watermark');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        // Add scrolled class for navbar animations
        if (scrolled > 50) {
            document.body.classList.add('scrolled');
        } else {
            document.body.classList.remove('scrolled');
        }
        
        if (watermark) {
            // Scale increases as you scroll
            const scale = 1 + (scrolled * 0.003);
            
            // Opacity drops from 1 to a minimum watermark opacity (e.g. 0.04)
            const opacity = Math.max(0.04, 1 - (scrolled * 0.002));
            
            // We translate it exactly by the scroll amount so it stays fixed to the viewport
            let transformStr = `translateY(${scrolled}px) scale(${scale})`;
            
            if (document.body.classList.contains('hobby-mode')) {
                const skew = Math.min(scrolled * 0.015, 10);
                transformStr += ` skewX(-${skew}deg)`;
            }
            
            watermark.style.transform = transformStr;
            watermark.style.opacity = opacity;
            
            // If scrolled, push it to background and disable pointer events so it's a true watermark
            if (scrolled > 50) {
                watermark.style.zIndex = '-1';
                watermark.style.pointerEvents = 'none';
            } else {
                watermark.style.zIndex = '1';
                watermark.style.pointerEvents = 'auto';
            }
        }
    });

    // --- Blog System ---
    const isHobby = document.body.classList.contains('hobby-mode');
    
    const blogData = isHobby ? [
        {
            title: "Tuning the Engine",
            category: "Motorsport",
            date: "May 18, 2026",
            excerpt: "The joy of fixing things with your own hands."
        },
        {
            title: "Late Night Gaming",
            category: "Gaming",
            date: "May 12, 2026",
            excerpt: "Why retro games still hold up today."
        },
        {
            title: "Synthwave Vibes",
            category: "Music",
            date: "May 05, 2026",
            excerpt: "Curating the perfect playlist for coding."
        },
        {
            title: "Anime Aesthetics",
            category: "Culture",
            date: "April 30, 2026",
            excerpt: "How 90s anime influences modern design."
        }
    ] : [
        {
            title: "Building Systems That Scale",
            category: "Product",
            date: "May 16, 2026",
            excerpt: "Observations on structuring startup workflows."
        },
        {
            title: "Neon Aesthetics in Web3",
            category: "Design",
            date: "May 10, 2026",
            excerpt: "Why dark mode and glow effects dominate crypto UI."
        },
        {
            title: "Late Night Thoughts on Evangelion",
            category: "Culture",
            date: "May 02, 2026",
            excerpt: "Analyzing the visual language of 90s mecha anime."
        },
        {
            title: "The Art of the Brutalist Web",
            category: "Engineering",
            date: "April 28, 2026",
            excerpt: "Returning to semantic HTML and bold borders."
        }
    ];

    const blogContainer = document.getElementById('blog-container');
    
    if (blogContainer) {
        blogData.forEach(post => {
            const article = document.createElement('article');
            article.className = 'blog-card scroll-reveal';
            
            article.innerHTML = `
                <div class="blog-info">
                    <span class="blog-meta">${post.category} // ${post.date}</span>
                    <h3>${post.title}</h3>
                    <p>${post.excerpt}</p>
                </div>
            `;
            
            blogContainer.appendChild(article);
        });
        
        // Re-observe newly added elements
        const newReveals = blogContainer.querySelectorAll('.scroll-reveal');
        newReveals.forEach(el => revealObserver.observe(el));
    }
});
