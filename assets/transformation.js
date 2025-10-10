const checkbox1 = document.getElementById('yourCheckboxId'); // Replace with your checkbox ID
let isChecked = false;
checkbox1.addEventListener('change', function() {
    isChecked = this.checked;
    return;
});
isChecked = checkbox1.checked;
const customCursor = document.getElementById("customCursor");
const zoomInput = document.getElementById('zoomRange');
const rotateInput = document.getElementById('rotateRange');
const resetBtn = document.getElementById('resetBtn');
const drawingArea = document.getElementById('drawingArea');
const wrapper = document.getElementById('container');
const container = document.getElementById('contain_dra-area');
const dragToggle = document.getElementById('dragToggle');

let scale = 1;
let rotation = 0;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startX, startY;
function updateTransform() {
    scale = parseFloat(zoomInput.value);
    rotation = parseFloat(rotateInput.value);
    drawingArea.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    centerIfNeeded();
}

function applyPosition() {
    drawingArea.style.left = `${offsetX}px`;
    drawingArea.style.top = `${offsetY}px`;
}

function centerIfNeeded() {
    const parentRect = container.getBoundingClientRect();
    const scaledWidth = 1000 * scale;
    const scaledHeight = 800 * scale;

    if (scaledWidth < parentRect.width) {
    offsetX = (parentRect.width - scaledWidth) / 2;
    }

    if (scaledHeight < parentRect.height) {
    offsetY = (parentRect.height - scaledHeight) / 2;
    }

    applyPosition();
}

function resetTransform() {
    zoomInput.value = 1;
    rotateInput.value = 0;
    scale = 1;
    rotation = 0;
    offsetX = 0;
    offsetY = 0;
    applyPosition();
    updateTransform();
}

// Mouse Drag
wrapper.addEventListener('mousedown', (e) => {
    if (!isChecked) return;
    isDragging = true;
    wrapper.classList.add('dragging');
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !isChecked) return;
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    applyPosition();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    wrapper.classList.remove('dragging');
});

// Touch Drag (1 or 2 finger pan)
wrapper.addEventListener('touchstart', (e) => {
    if (!isChecked || e.touches.length < 1) return;
    isDragging = true;
    wrapper.classList.add('dragging');
    startX = e.touches[0].clientX - offsetX;
    startY = e.touches[0].clientY - offsetY;
});

window.addEventListener('touchmove', (e) => {
    if (!isDragging || !isChecked) return;
    offsetX = e.touches[0].clientX - startX;
    offsetY = e.touches[0].clientY - startY;
    applyPosition();
});

window.addEventListener('touchend', () => {
    isDragging = false;
    wrapper.classList.remove('dragging');
});
// Events
zoomInput.addEventListener('input', updateTransform);
rotateInput.addEventListener('input', updateTransform);
resetBtn.addEventListener('click', resetTransform);
// Init
updateTransform();

// const drawingArea = document.getElementById("drawingArea");
const layerList = document.getElementById("layerList");
const colorPicker = document.getElementById("colorPicker");
let selectedColor = colorPicker.value;
const thicknessSlider = document.getElementById("thicknessSlider");
const eraserIntensity = document.getElementById("eraserIntensity");
const imageInput = document.getElementById("imageInput");

const ruler = document.getElementById("movableRuler");

let layers = [];
let layersetting = [];
let activeLayer = null;
let activeTool = "pen"; // line, tringle, eraser
let drawing = false;
let history = [];
let redoStack = [];
let canvas;
let points = [];
let startPoint = { x: 0, y: 0 };
let currentPoint = { x: 0, y: 0 };
let savedImageData = null;
let activeline = false;
function createCanvasLayer() {
    canvas = document.createElement("canvas");
    canvas.classList.add("layer");
    canvas.width = drawingArea.clientWidth;
    canvas.height = drawingArea.clientHeight;
    drawingArea.appendChild(canvas);
    return canvas;
}
function createsettingtool(){

    const toolPanelHTML = `
        <div class="cansetTool">
        </div>
        `;
    //     <div class="cansetTool">
    //     // <table>
    //     //     <tr>
    //     //         <td>
    //     //             <button class="Duplicate_layer">Duplicate</button>
    //     //         </td>
    //     //     <td>
    //     //         <button class="hide_layer">
    //     //             hide
    //     //         </button>
    //     //     </td>
    //     //     </tr>
    //     //     <tr>
    //     //         <td>
    //     //             <button class="reset_layer">Reset</button>
    //     //         </td>
    //     //         <td>
    //     //             <button class="bg_layer">bg</button>
    //     //         </td>
    //     //     </tr>
    //     //     <tr>
    //     //         <td>
    //     //             <input type="color" class="layer_color_picker" value="transparent">
    //     //         </td>
    //     //         <td>
    //     //             <div class="input_group">
    //     //                 <label for="numberInput">Opacity:</label><br>
    //     //                 <input type="number" class="numberInput" min="1" max="100" value="100" oninput="syncInputs(this.value)">
    //     //             </div>
    //     //         </td>
    //     //     </tr>
    //     // </table>
    // </div>
        const wrapper = document.createElement('div');
        wrapper.innerHTML = toolPanelHTML.trim();
        return wrapper.firstElementChild;

    
}
function addLayer() {
    canvas = createCanvasLayer();
    canvasSetting = createsettingtool();
    layers.push(canvas);
    layersetting.push(canvasSetting);
    selectLayer(layers.length - 1);
    updateLayerPanel();
    saveState();
}

function selectLayer(index) {
    activeLayer = layers[index];
    document.querySelectorAll(".layer-item").forEach((item, i) => {
    item.classList.toggle("active", i === index);
    });
}

function updateLayerPanel() {
    layerList.innerHTML = "";
    layers.forEach((layer, index) => {
        const div = document.createElement("div");
        const preview1 = document.createElement("div");
        if (layer.canvas) {
            preview1.style.backgroundImage = `url(${layer.canvas.toDataURL()})`;
        } else {
            preview1.style.backgroundImage = "red"; 
        }
        preview1.style.backgroundImage = `url(${layer.toDataURL()})`;
        preview1.className = "layer-preview"; 
        div.className = "layer-item"; 
        let p2 = layersetting[index];
        div.appendChild(p2);
        div.appendChild(preview1); 
        div.onclick = () => selectLayer(index); 
        if (layer === activeLayer) {
            div.classList.add("active");
        }
        layerList.appendChild(div);
    });
      
}

function moveLayerUp() {
    const index = layers.indexOf(activeLayer);
    if (index < layers.length - 1) {
    [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
    drawingArea.appendChild(layers[index]);
    drawingArea.appendChild(layers[index + 1]);
    updateLayerPanel();
    saveState();
    }
}

function moveLayerDown() {
    const index = layers.indexOf(activeLayer);
    if (index > 0) {
    [layers[index], layers[index - 1]] = [layers[index - 1], layers[index]];
    drawingArea.appendChild(layers[index - 1]);
    drawingArea.appendChild(layers[index]);
    updateLayerPanel();
    saveState();
    }
}

function removeLayer() {
    const index = layers.indexOf(activeLayer);
    if (index >= 0) {
    drawingArea.removeChild(activeLayer);
    layers.splice(index, 1);
    if (layers.length > 0) {
        selectLayer(Math.max(index - 1, 0));
    } else {
        activeLayer = null;
    }
    updateLayerPanel();
    saveState();
    }
}

document.getElementById("penTool").onclick = () => activeTool = "pen";
document.getElementById("eraserTool").onclick = () => activeTool = "eraser";
// document.getElementById("lineTool").onclick = () => activeTool = "lineTool";
// document.getElementById("rulerTool").onclick = () => {
//     activeTool = "ruler";
//     ruler.style.display = "block";
// };

drawingArea.addEventListener("mousedown", (e) => {
    drawing = true;
    let ctx = activeLayer.getContext("2d");
    if (!activeLayer || isChecked) return;
    if(drawing || activeTool == "pen"){
        startX = e.offsetX;
        startY = e.offsetY;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        activeline = true;
    }
    else if (activeTool == "lineTool") {
        const rect = activeLayer.getContext("2d");
        startPoint.x = e.clientX - rect.left;
        startPoint.y = e.clientY - rect.top;
            // savedImageData = ctx.getImageData(0, 0, activeLayer.width, activeLayer.height);
    }
});

drawingArea.addEventListener("mousemove", (e) => {
    if (!drawing || !activeLayer) return;
    if(isChecked) return;
    const ctx = activeLayer.getContext("2d");
    const x = e.offsetX;
    const y = e.offsetY;
    if (activeTool == "lineTool") {
        // const rect = activeLayer.getBoundingClientRect();
        // currentPoint.x = e.clientX - rect.left;
        // currentPoint.y = e.clientY - rect.top;
        // // ctx.putImageData(savedImageData, 0, 0);
        // drawLine(startPoint, currentPoint, "pink");
    } {
        ctx.lineTo(x, y);
        ctx.globalCompositeOperation = "destination-out"; 
        ctx.strokeStyle = "rgba(255, 255, 255, " + (eraserIntensity.value / 100) + ")"; 
        ctx.lineTo(x, y); ctx.globalCompositeOperation = activeTool === "eraser" ? "destination-out" : "source-over"; ctx.strokeStyle = activeTool === "eraser" ? "rgba(255,255,255," + (eraserIntensity.value / 100) + ")" : colorPicker.value; ctx.lineWidth = thicknessSlider.value; ctx.lineCap = "round"; ctx.stroke();
        ctx.strokeStyle = activeTool === "eraser" ? "rgba(255,255,255," + (eraserIntensity.value / 100) + ")" : colorPicker.value;
        ctx.lineWidth = thicknessSlider.value;
        ctx.lineCap = "round";
        ctx.stroke();
    function drawWithPen(ctx) {
        // let points = [];
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = parseInt(thicknessSlider.value);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        if (points.length < 3) {
        ctx.lineTo(points[0].x, points[0].y);
        ctx.stroke();
        return;
        }
            
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            
            for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            
            ctx.stroke();
        }
        function erase(ctx) {
        const intensity = parseInt(eraserIntensity.value) / 100;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = parseInt(thicknessSlider.value);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.globalAlpha = intensity;
        
        if (points.length < 3) {
            ctx.lineTo(points[0].x, points[0].y);
            ctx.stroke();
            return;
        }
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        }  

        if(activeTool === "pen"){
            drawWithPen(ctx)
        }
        else{
            erase(ctx)
        }
   }
});

drawingArea.addEventListener("mouseup", (e) => {
    if(activeTool === "lineTool" && activeline){
        const rect = drawingArea.getBoundingClientRect();
        const endPoint = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
            };
        drawLine(startPoint, endPoint, selectedColor); 
        saveState();
    }
    drawing = false;
    if (!drawing){
        return;
    }
});
function drawLine(p1, p2, color3) {
    ctx3 = activeLayer.getContext('2d');
    ctx3.beginPath();
    ctx3.moveTo(p1.x, p1.y);
    ctx3.lineTo(p2.x, p2.y);
    ctx3.strokeStyle = color3;
    ctx3.lineWidth = thicknessSlider.value;
    ctx3.lineCap = 'round';
    ctx3.stroke();
  }

function saveState() {
    const state = layers.map(layer => layer.toDataURL());
    history.push(state);
    if (history.length > 50) history.shift();
    redoStack = [];
}

function restoreState(state) {
    layers.forEach((layer, i) => {
    const img = new Image();
    img.onload = () => {
        const ctx = layer.getContext("2d");
        ctx.clearRect(0, 0, layer.width, layer.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = state[i];
    });
}

function undo() {
    if (history.length < 2) return;
    redoStack.push(history.pop());
    restoreState(history[history.length - 1]);
}

function redo() {
    if (!redoStack.length) return;
    const state = redoStack.pop();
    history.push(state);
    restoreState(state);
}

// imageInput.addEventListener("change", function () {
//     if (!activeLayer) return;
//     const file = this.files[0];
//     if (file) {
//     const reader = new FileReader();
//     reader.onload = function (e) {
//         const img = new Image();
//         img.onload = function () {
//         const ctx = activeLayer.getContext("2d");
//         ctx.drawImage(img, 0, 0, activeLayer.width, activeLayer.height);
//         saveState();
//         };
//         img.src = e.target.result;
//     };
//     reader.readAsDataURL(file);
//     }
// });


//   function updateCursorPosition(e) {
//     const rect = drawingArea.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
    
//     customCursor.style.left = `${x}px`;
//     customCursor.style.top = `${y}px`;
//   }
// function updateCursorPosition(e) {
//     const rect = drawingArea.getBoundingClientRect();
//     const style = window.getComputedStyle(drawingArea);
//     const matrix = new DOMMatrix(style.transform);
    
//     // Get mouse position relative to element
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
    
//     // If element is transformed, adjust coordinates
//     if (matrix.isIdentity) {
//       // No transformation - use simple positioning
//       customCursor.style.left = `${x}px`;
//       customCursor.style.top = `${y}px`;
//     } else {
//       // Apply inverse transformation to get correct position
//       const inverseMatrix = matrix.inverse();
//       const transformedX = x * inverseMatrix.a + y * inverseMatrix.c + inverseMatrix.e;
//       const transformedY = x * inverseMatrix.b + y * inverseMatrix.d + inverseMatrix.f;
      
//       customCursor.style.left = `${transformedX}px`;
//       customCursor.style.top = `${transformedY}px`;
//     }
//   }

function updateDrawingAreaCursor() {
    let thicknessSlider = document.getElementById('thicknessSlider');
    let size = parseInt(thicknessSlider.value);
    const radius = Math.max(1, size / 2 - 2);
    const hotspot = size / 2;
    
    const cursorSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" 
             width="${size}" 
             height="${size}" 
             viewBox="0 0 ${size} ${size}">
            <circle cx="${hotspot}" 
                    cy="${hotspot}" 
                    r="${radius}" 
                    fill="none" 
                    stroke="red" 
                    stroke-width="2"/>
        </svg>
    `;
    
    const cursorURL = `url('data:image/svg+xml;utf8,${encodeURIComponent(cursorSVG)}') ${hotspot} ${hotspot}, auto`;
    
    drawingArea.style.cursor = cursorURL;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// this is where i will be haing save image and setting it

    const previewCanvas = document.getElementById('previewCanvas');
    const ctxPreview = previewCanvas.getContext('2d');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const ctxOverlay = overlayCanvas.getContext('2d');
    const overlay = document.getElementById('imageUploadOverlay');
    const alertBox = document.getElementById('imageUploadAlert');
    const applyBtn = document.getElementById('applyImage');

    const controls = {
      opacity: document.getElementById('opacityRange'),
      zoom: document.getElementById('zoomRange'),
      blur: document.getElementById('blurRange'),
      rotation: document.getElementById('rotationRange'),
      brightness: document.getElementById('brightnessRange'),
      contrast: document.getElementById('contrastRange'),
      grayscale: document.getElementById('grayscaleRange'),
      hue: document.getElementById('hueRange'),
      invert: document.getElementById('invertRange'),
      saturate: document.getElementById('saturateRange'),
      sepia: document.getElementById('sepiaRange')
    };

    let image = new Image();
    let imgX = 0, imgY = 0, isDragging1 = false, offsetX1 = 0, offsetY1 = 0;

    function openAlert() {
    //   overlay.style.display = 'flex';
      alertBox.style.display = 'flex';

      ctxOverlay.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      ctxOverlay.drawImage(activeLayer, 0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    function closeAlert() {
    //   overlay.style.display = 'none';
      alertBox.style.display = 'none';
      ctxPreview.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      ctxOverlay.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    function getFilterStyle() {
      return `
        blur(${controls.blur.value}px)
        brightness(${controls.brightness.value}%)
        contrast(${controls.contrast.value}%)
        grayscale(${controls.grayscale.value}%)
        hue-rotate(${controls.hue.value}deg)
        invert(${controls.invert.value}%)
        opacity(${controls.opacity.value})
        saturate(${controls.saturate.value}%)
        sepia(${controls.sepia.value}%)
      `;
    }

    function drawPreview() {
        ctxPreview.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        const zoom = parseFloat(controls.zoom.value);
        const rotation = parseFloat(controls.rotation.value) * Math.PI / 180;

        // Create a temporary canvas to apply filters
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.filter = getFilterStyle();
        tempCtx.drawImage(image, 0, 0);

        // Compute zoomed dimensions
        const drawWidth = image.width * zoom;
        const drawHeight = image.height * zoom;

        // Rotate and draw in one pass
        ctxPreview.save();
        ctxPreview.translate(imgX + drawWidth / 2, imgY + drawHeight / 2);
        ctxPreview.rotate(rotation);
        ctxPreview.drawImage(tempCanvas, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctxPreview.restore();
    }
    // imageInput.addEventListener("change", function () {
//     if (!activeLayer) return;
//     const file = this.files[0];
//     if (file) {
//     const reader = new FileReader();
//     reader.onload = function (e) {
//         const img = new Image();
//         img.onload = function () {
//         const ctx = activeLayer.getContext("2d");
//         ctx.drawImage(img, 0, 0, activeLayer.width, activeLayer.height);
//         saveState();
//         };
//         img.src = e.target.result;
//     };
//     reader.readAsDataURL(file);
//     }
// });
    imageInput.addEventListener("change", function () {
      if (!activeLayer) return;
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          image.onload = function () {
            imgX = 0;
            imgY = 0;
            drawPreview();
            openAlert();
          };
          image.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    Object.values(controls).forEach(ctrl => ctrl.addEventListener("input", drawPreview));

    previewCanvas.addEventListener("mousedown", (e) => {
      isDragging1 = true;
      offsetX1 = e.offsetX - imgX;
      offsetY1 = e.offsetY - imgY;
    });

    previewCanvas.addEventListener("mousemove", (e) => {
      if (isDragging1) {1
        imgX = e.offsetX - offsetX1;
        imgY = e.offsetY - offsetY1;
        drawPreview();
      }
    });

    previewCanvas.addEventListener("mouseup", () => isDragging1 = false);
    previewCanvas.addEventListener("mouseleave", () => isDragging1 = false);

    applyBtn.addEventListener("click", function () {
      const ctxq = activeLayer.getContext("2d");
      const zoom = parseFloat(controls.zoom.value);
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.filter = getFilterStyle();
      tempCtx.drawImage(image, 0, 0);

      ctxq.globalAlpha = parseFloat(controls.opacity.value);
      ctxq.drawImage(tempCanvas, imgX, imgY, image.width * zoom, image.height * zoom);
      ctxq.globalAlpha = 1;

      closeAlert();
      saveState(); 
      imageInput.value = "";
      // me
    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// _______________________________________________________________________________________________________________________________
// export funtions
//save as png
function saveImage() {
    if (layers.length <= 0) {
        alert("no layer");
        return;
    }
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = drawingArea.clientWidth;
    exportCanvas.height = drawingArea.clientHeight;
    const exportCtx = exportCanvas.getContext("2d");
    layers.forEach(layer => {
    exportCtx.drawImage(layer, 0, 0);
    });
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = exportCanvas.toDataURL();
    link.click();
}

// save as ora

function buildStackXML() {
    const stack = layers.map((layer, i) => {
        return `<layer name="${layer.name}" src="data/layer${i}.png" x="${layer.x}" y="${layer.y}" opacity="${layer.opacity}" visibility="${layer.visible ? 'visible' : 'hidden'}" />`;
    }).reverse().join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<image w="600" h="400" version="0.0.1" xmlns="http://www.freedesktop.org/standards/openraster">
${stack}
</image>`;
}

async function downloadORA() {
    if(layers.length <= 0){
        alert("their is not layer for download");
        return;
    }
    const zip = new JSZip();
    zip.file("mimetype", "image/openraster");
    const dataFolder = zip.folder("data");
  
    for (let i = 0; i < layers.length; i++) {
      const canvas = layers[i];
  
      if (!(canvas instanceof HTMLCanvasElement)) {
        console.warn(`Layer ${i} is not a canvas, skipping.`);
        continue;
      }
  
      console.log(`Processing layer ${i}...`);
  
      // Await blob creation per canvas
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(`Failed to get blob for layer ${i}`));
          }
        }, "image/png");
      });
  
      dataFolder.file(`layer${i}.png`, blob);
      console.log(`Added layer ${i} blob to zip.`);
    }
  
    console.log("All layers processed, generating zip...");
    const content = await zip.generateAsync({ type: "blob" });
    console.log("Zip generated, starting download.");
  
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "project.ora";
    link.click();
  
    console.log("Download triggered.");
  }
  
// =================================================================================================================================
thicknessSlider.addEventListener('input', updateDrawingAreaCursor);
drawingArea.addEventListener("mousemove", updateDrawingAreaCursor);
// Initialize with one layer
addLayer();
document.getElementById("drawingArea").addEventListener('mousemove', () => {
    updateLayerPanel();
});
// updateCursor();
