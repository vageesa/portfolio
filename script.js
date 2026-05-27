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
                        let imgPath = proj.image;
                        if (imgPath && imgPath.startsWith('/')) {
                            imgPath = imgPath.substring(1);
                        }
                        const imageStyle = imgPath ? `background-image: url('${imgPath}');` : `background: #333;`;
                        div.innerHTML = `
                            <div class="project-img placeholder-img" style="${imageStyle}"></div>
                            <div class="project-info">
                                <h3>${proj.title || ''}</h3>
                                <p>${proj.description || ''}</p>
                                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: auto;">
                                    ${proj.link ? `<a href="${proj.link}" class="btn btn-outline btn-sm" target="_blank">${proj.link_label || 'Case Study'}</a>` : ''}
                                    ${proj.github_link ? `<a href="${proj.github_link}" class="btn btn-outline btn-sm" target="_blank" style="border-color: #333; color: inherit;">GitHub</a>` : ''}
                                </div>
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

                // Populate Background Stickers if available (Hobby Mode)
                if (data.stickers && data.stickers.length > 0) {
                    let stickersContainer = document.querySelector('.stickers-container');
                    if (!stickersContainer) {
                        stickersContainer = document.createElement('div');
                        stickersContainer.className = 'stickers-container';
                        // Insert it at the very beginning of the body
                        document.body.insertBefore(stickersContainer, document.body.firstChild);
                    }
                    
                    data.stickers.forEach((sticker, index) => {
                        const img = document.createElement('img');
                        let imgPath = sticker.image;
                        if (imgPath && imgPath.startsWith('/')) {
                            imgPath = imgPath.substring(1);
                        }
                        img.src = imgPath;
                        img.alt = sticker.alt || 'Sticker';
                        
                        // Use transparent-sticker as base class. If it's an SVG, maybe add generic .sticker class.
                        img.className = 'transparent-sticker sticker-dynamic scroll-reveal';
                        if (sticker.is_svg) {
                            img.classList.remove('transparent-sticker');
                            img.classList.add('sticker');
                        }

                        // Apply inline styles based on CMS config
                        let styleStr = '';
                        if (sticker.top && sticker.top !== 'auto') styleStr += `top: ${sticker.top}; `;
                        if (sticker.bottom && sticker.bottom !== 'auto') styleStr += `bottom: ${sticker.bottom}; `;
                        if (sticker.left && sticker.left !== 'auto') styleStr += `left: ${sticker.left}; `;
                        if (sticker.right && sticker.right !== 'auto') styleStr += `right: ${sticker.right}; `;
                        
                        const rot = sticker.rotation || '0deg';
                        const scl = sticker.scale || '1.0';
                        const hov = sticker.hover_opacity || '1.0';
                        
                        img.style.setProperty('--tx', '0px');
                        img.style.setProperty('--rot', rot);
                        img.style.setProperty('--scl', scl);
                        img.style.setProperty('--hover-opacity', hov);
                        
                        styleStr += `transform: translateX(var(--tx)) rotate(var(--rot)) scale(var(--scl)); `;
                        
                        if (sticker.opacity) styleStr += `opacity: ${sticker.opacity}; `;
                        if (sticker.blend_mode && sticker.blend_mode !== 'normal') {
                            styleStr += `mix-blend-mode: ${sticker.blend_mode}; `;
                        }
                        
                        img.setAttribute('style', styleStr);
                        
                        // Initialize drag system
                        const stickerId = 'sticker_' + (sticker.alt ? sticker.alt.replace(/\s+/g, '_').toLowerCase() : index);
                        makeDraggable(img, stickerId);
                        
                        stickersContainer.appendChild(img);
                    });

                    // Add scroll effect for stickers
                    window.addEventListener('scroll', () => {
                        const scrolled = window.scrollY;
                        document.querySelectorAll('.sticker-dynamic').forEach(sticker => {
                            // Find out if sticker is on left or right half
                            const rect = sticker.getBoundingClientRect();
                            // Use left offset percentage if available, or bounding box center
                            let direction = 1;
                            if (sticker.style.left && sticker.style.left.includes('%')) {
                                direction = parseFloat(sticker.style.left) < 50 ? -1 : 1;
                            } else {
                                const centerX = rect.left + (rect.width / 2);
                                direction = centerX < window.innerWidth / 2 ? -1 : 1;
                            }
                            
                            // Calculate translation and fade out
                            const moveSpeed = 1.2; // How fast it fans out
                            const tx = scrolled * moveSpeed * direction;
                            sticker.style.setProperty('--tx', `${tx}px`);
                        });
                    });
                }
                
                // Re-observe newly added elements across all dynamic containers
                const newReveals = document.querySelectorAll('#experience-container .scroll-reveal, #projects-container .scroll-reveal, #blog-container .scroll-reveal, .project-card.scroll-reveal');
                newReveals.forEach(el => revealObserver.observe(el));
            })
            .catch(error => {
                console.error("Error loading blog posts:", error);
                blogContainer.innerHTML = '<p>Unable to load blog posts at this time.</p>';
            });
    }

    // --- Sticker Drag & Drop System ---
    function makeDraggable(element, stickerId) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        // Check local storage for saved lock state and positions
        let isLocked = localStorage.getItem('lock_' + stickerId) === 'true';
        const savedPos = localStorage.getItem('pos_' + stickerId);
        const savedScale = localStorage.getItem('scale_' + stickerId);
        
        element.style.cursor = isLocked ? 'default' : 'grab';
        element.title = isLocked ? "Locked (Double-click to unlock)" : "Drag to move, Scroll to resize (Double-click to lock)";
        
        if (savedPos) {
            try {
                const coords = JSON.parse(savedPos);
                element.style.top = coords.top;
                element.style.left = coords.left;
                element.style.bottom = 'auto'; 
                element.style.right = 'auto';
            } catch(e) {}
        }
        
        let currentScale = 1.0;
        let currentRotation = '0deg';
        
        // Use custom properties instead of parsing strings
        currentScale = parseFloat(element.style.getPropertyValue('--scl')) || 1.0;
        currentRotation = element.style.getPropertyValue('--rot') || '0deg';
        
        // Apply saved scale if exists
        if (savedScale) {
            currentScale = parseFloat(savedScale);
            element.style.setProperty('--scl', currentScale);
        }

        element.addEventListener('dblclick', (e) => {
            isLocked = !isLocked;
            localStorage.setItem('lock_' + stickerId, isLocked);
            element.style.cursor = isLocked ? 'default' : 'grab';
            element.title = isLocked ? "Locked (Double-click to unlock)" : "Drag to move, Scroll to resize (Double-click to lock)";
            
            // Visual feedback flash
            element.style.transition = 'filter 0.3s ease';
            const originalFilter = element.style.filter;
            element.style.filter = isLocked ? 'brightness(0.5) sepia(1)' : 'brightness(1.5)';
            setTimeout(() => {
                element.style.filter = '';
            }, 300);
        });

        // Wheel to resize
        element.addEventListener('wheel', (e) => {
            if (isLocked) return;
            e.preventDefault();
            
            if (e.deltaY < 0) {
                currentScale += 0.05;
            } else {
                currentScale -= 0.05;
            }
            
            if (currentScale < 0.2) currentScale = 0.2;
            if (currentScale > 4.0) currentScale = 4.0;
            
            element.style.setProperty('--scl', currentScale);
            localStorage.setItem('scale_' + stickerId, currentScale);
        });

        element.addEventListener('mousedown', dragMouseDown);
        
        function dragMouseDown(e) {
            if (isLocked) return;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.addEventListener('mouseup', closeDragElement);
            document.addEventListener('mousemove', elementDrag);
            element.style.cursor = 'grabbing';
            element.style.zIndex = '100';
            element.style.transition = 'none'; // Disable transition while dragging
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            element.style.bottom = 'auto';
            element.style.right = 'auto';
            
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
            element.style.cursor = isLocked ? 'default' : 'grab';
            element.style.zIndex = '';
            element.style.transition = ''; // Restore transition
            
            // Save new position
            localStorage.setItem('pos_' + stickerId, JSON.stringify({
                top: element.style.top,
                left: element.style.left
            }));
        }
    }
});
