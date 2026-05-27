document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('studio-canvas');
    const editor = document.getElementById('sticker-editor');
    const btnExport = document.getElementById('btn-export');
    const jsonOutput = document.getElementById('json-output');
    const fileUpload = document.getElementById('upload-sticker');
    
    // Editor inputs
    const sliderOpacity = document.getElementById('slider-opacity');
    const valOpacity = document.getElementById('val-opacity');
    const sliderRotation = document.getElementById('slider-rotation');
    const valRotation = document.getElementById('val-rotation');
    const btnDelete = document.getElementById('btn-delete-sticker');

    let stickersData = [];
    let activeStickerIndex = null;

    // Load existing data
    fetch('data/hobby.json?t=' + new Date().getTime())
        .then(res => res.json())
        .then(data => {
            if (data.stickers) {
                stickersData = data.stickers;
                renderStickers();
            }
        });

    function renderStickers() {
        canvas.innerHTML = '';
        stickersData.forEach((sticker, index) => {
            const img = document.createElement('img');
            
            // Handle DataURLs for newly uploaded files, otherwise use the path
            let imgPath = sticker.image;
            if (imgPath && imgPath.startsWith('/') && !imgPath.startsWith('data:')) {
                imgPath = imgPath.substring(1);
            }
            img.src = imgPath;
            img.alt = sticker.alt || `Sticker ${index}`;
            img.className = sticker.is_svg ? 'sticker' : 'transparent-sticker';
            
            // Set styles exactly as they are in the JSON
            let styleStr = '';
            if (sticker.top && sticker.top !== 'auto') styleStr += `top: ${sticker.top}; `;
            if (sticker.bottom && sticker.bottom !== 'auto') styleStr += `bottom: ${sticker.bottom}; `;
            if (sticker.left && sticker.left !== 'auto') styleStr += `left: ${sticker.left}; `;
            if (sticker.right && sticker.right !== 'auto') styleStr += `right: ${sticker.right}; `;
            
            const rot = sticker.rotation || '0deg';
            const scl = sticker.scale || '1.0';
            styleStr += `transform: rotate(${rot}) scale(${scl}); `;
            
            // Base opacity if they have it (the studio allows editing hover opacity primarily, but we can store it)
            if (sticker.opacity) styleStr += `opacity: ${sticker.opacity}; `;
            if (sticker.blend_mode && sticker.blend_mode !== 'normal') {
                styleStr += `mix-blend-mode: ${sticker.blend_mode}; `;
            }
            
            img.setAttribute('style', styleStr);
            img.dataset.index = index;
            
            makeStudioDraggable(img, index);
            canvas.appendChild(img);
        });
    }

    // Handle File Upload
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            // Add to data array
            const newSticker = {
                "image": dataUrl, // we store data url for preview, but export will ask them to update it
                "alt": file.name.split('.')[0],
                "top": "50%",
                "left": "50%",
                "right": "auto",
                "bottom": "auto",
                "rotation": "0deg",
                "scale": "1.0",
                "opacity": "0.15",
                "hover_opacity": "1.0",
                "blend_mode": "normal",
                "is_svg": file.name.endsWith('.svg')
            };
            stickersData.push(newSticker);
            renderStickers();
        };
        reader.readAsDataURL(file);
    });

    function makeStudioDraggable(element, index) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        // Setup initial scale and rotation from data
        let currentScale = parseFloat(stickersData[index].scale) || 1.0;
        let currentRotation = stickersData[index].rotation || '0deg';

        element.addEventListener('mousedown', dragMouseDown);
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditor(index, e.clientX, e.clientY);
        });

        element.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) currentScale += 0.05;
            else currentScale -= 0.05;
            
            if (currentScale < 0.2) currentScale = 0.2;
            if (currentScale > 4.0) currentScale = 4.0;
            
            currentScale = Math.round(currentScale * 100) / 100;
            stickersData[index].scale = currentScale.toString();
            updateTransform(element, currentRotation, currentScale);
        });

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.addEventListener('mouseup', closeDragElement);
            document.addEventListener('mousemove', elementDrag);
            element.style.cursor = 'grabbing';
            element.style.zIndex = '100';
            editor.style.display = 'none'; // hide editor when dragging
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            element.style.bottom = 'auto';
            element.style.right = 'auto';
            
            // Convert px to % for better responsive layout in JSON
            const newTopPx = element.offsetTop - pos2;
            const newLeftPx = element.offsetLeft - pos1;
            
            const topPerc = ((newTopPx / window.innerHeight) * 100).toFixed(2) + '%';
            const leftPerc = ((newLeftPx / window.innerWidth) * 100).toFixed(2) + '%';
            
            element.style.top = topPerc;
            element.style.left = leftPerc;
            
            stickersData[index].top = topPerc;
            stickersData[index].left = leftPerc;
            stickersData[index].bottom = 'auto';
            stickersData[index].right = 'auto';
        }

        function closeDragElement() {
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
            element.style.cursor = 'pointer';
            element.style.zIndex = '';
        }
        
        function updateTransform(el, rot, scl) {
            el.style.transform = `rotate(${rot}) scale(${scl})`;
        }
    }

    // Editor Logic
    function openEditor(index, x, y) {
        activeStickerIndex = index;
        const sticker = stickersData[index];
        
        // Position editor near click
        editor.style.display = 'block';
        editor.style.left = Math.min(x + 20, window.innerWidth - 270) + 'px';
        editor.style.top = Math.min(y + 20, window.innerHeight - 200) + 'px';
        
        // Populate values
        const rotVal = parseInt(sticker.rotation || 0);
        sliderRotation.value = rotVal;
        valRotation.innerText = rotVal + 'deg';
        
        const hovOpac = sticker.hover_opacity || "1.0";
        sliderOpacity.value = hovOpac;
        valOpacity.innerText = hovOpac;
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#sticker-editor') && !e.target.closest('.transparent-sticker') && !e.target.closest('.sticker')) {
            editor.style.display = 'none';
        }
    });

    sliderRotation.addEventListener('input', (e) => {
        if (activeStickerIndex === null) return;
        const val = e.target.value + 'deg';
        valRotation.innerText = val;
        stickersData[activeStickerIndex].rotation = val;
        
        // Update DOM
        const el = document.querySelector(`img[data-index="${activeStickerIndex}"]`);
        if (el) {
            el.style.transform = `rotate(${val}) scale(${stickersData[activeStickerIndex].scale || 1})`;
        }
    });

    sliderOpacity.addEventListener('input', (e) => {
        if (activeStickerIndex === null) return;
        valOpacity.innerText = e.target.value;
        stickersData[activeStickerIndex].hover_opacity = e.target.value;
    });

    btnDelete.addEventListener('click', () => {
        if (activeStickerIndex === null) return;
        stickersData.splice(activeStickerIndex, 1);
        editor.style.display = 'none';
        renderStickers();
    });

    // Export Logic
    btnExport.addEventListener('click', () => {
        // Deep copy
        const exportData = JSON.parse(JSON.stringify(stickersData));
        
        // Clean up DataURLs (replace with placeholder)
        exportData.forEach(s => {
            if (s.image && s.image.startsWith('data:')) {
                s.image = "/images/uploads/" + s.alt.replace(/\s+/g, '-').toLowerCase() + ".png";
            }
        });
        
        jsonOutput.value = JSON.stringify(exportData, null, 2);
        
        // Copy to clipboard automatically
        navigator.clipboard.writeText(jsonOutput.value).then(() => {
            btnExport.innerText = "Copied to Clipboard!";
            setTimeout(() => { btnExport.innerText = "Export JSON Configuration"; }, 2000);
        });
    });
});
