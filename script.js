document.addEventListener('DOMContentLoaded', () => {
    // --- Hero Subtext Word Bulge Effect ---
    const heroSubs = document.querySelectorAll('.hero-sub p');
    heroSubs.forEach(heroSub => {
        const text = heroSub.textContent;
        heroSub.innerHTML = text.split(' ').map(word => `<span class="hover-word">${word}</span>`).join(' ');
    });

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
    const dataFile = isHobby ? 'data/hobby.json' : 'data/professional.json';
    const blogContainer = document.getElementById('blog-container');
    
    if (blogContainer) {
        // Add a timestamp cache-buster so the browser doesn't load old blogs
        const fetchUrl = dataFile + '?t=' + new Date().getTime();
        
        fetch(fetchUrl)
            .then(response => response.json())
            .then(data => {
                // Populate About Text if available
                const aboutElement = document.getElementById('about-text');
                if (aboutElement && data.about_text) {
                    aboutElement.innerText = data.about_text;
                }

                // Populate Experience Timeline if available
                const expContainer = document.getElementById('experience-container');
                if (expContainer && data.experience) {
                    data.experience.forEach(exp => {
                        const div = document.createElement('div');
                        div.className = 'timeline-item';
                        div.innerHTML = `
                            <div class="timeline-meta">${exp.year || ''}</div>
                            <div class="timeline-content">
                                <h3>${exp.title || ''}</h3>
                                <p>${exp.description || ''}</p>
                            </div>
                        `;
                        expContainer.appendChild(div);
                    });
                }

                // Populate Projects Grid if available
                const projContainer = document.getElementById('projects-container');
                if (projContainer && data.projects) {
                    data.projects.forEach(proj => {
                        const div = document.createElement('div');
                        div.className = 'project-card scroll-reveal';
                        const imageStyle = proj.image ? `background-image: url('${proj.image}');` : `background: #333;`;
                        div.innerHTML = `
                            <div class="project-img placeholder-img" style="${imageStyle}"></div>
                            <div class="project-info">
                                <h3>${proj.title || ''}</h3>
                                <p>${proj.description || ''}</p>
                                <a href="${proj.link || '#'}" class="btn btn-outline btn-sm" target="_blank">Case Study</a>
                            </div>
                        `;
                        projContainer.appendChild(div);
                    });
                }

                const posts = data.posts || [];
                posts.forEach(post => {
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
            })
            .catch(error => {
                console.error("Error loading blog posts:", error);
                blogContainer.innerHTML = '<p>Unable to load blog posts at this time.</p>';
            });
    }
});
