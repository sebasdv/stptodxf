# STEP to DXF Web Viewer (Frontend Only)

## Objective

Develop a web-based application that allows users to upload a `.step` file, visualize it in 3D directly in the browser, and generate orthographic 2D projections (Top, Front, Right, Isometric) that can be exported as **DXF** or **SVG** files.  
All operations must run entirely in the browser without any backend or server-side processing.  
The solution must be compatible with **GitHub Pages** (static hosting).

---

## Technical Specifications

### 1. Architecture

- 100% frontend implementation (no server or backend dependencies).  
- Deployable on **GitHub Pages** as a static site (HTML, JS, CSS only).  
- Recommended framework: **Vanilla JS** or **React + Vite**.  
- 3D rendering: **Three.js**.  
- STEP file parsing: **occt-import-js** (OpenCascade compiled to WebAssembly).  
- 2D export: **three-dxf** or **svgexport.js**.  

---

### 2. User Flow

1. The user uploads or drags a `.step` file into the page.  
2. The file is parsed locally using WebAssembly (no server).  
3. The model is rendered inside a Three.js 3D viewer.  
4. The user selects a predefined view: Top, Front, Right, or Isometric.  
5. The system generates a 2D orthographic projection.  
6. The user can export the projection as a DXF or SVG file.  
7. The resulting file is downloaded directly to the user’s device.

---

### 3. Minimum Components

#### index.html
- Contains a `<canvas>` element for the Three.js viewer.  
- Basic UI controls: file upload, view selection, export buttons.  
- Simple styling (Tailwind or plain CSS).

#### main.js
- Initializes the scene, camera, and renderer.  
- Loads the STEP file using `occt-import-js`.  
- Converts geometry to Three.js meshes.  
- Provides functions to set camera views (`setViewTop`, `setViewFront`, etc.).  
- Handles export via `three-dxf`.

#### dxf-exporter.js
- Converts visible 3D geometry into 2D projected entities (lines/polylines).  
- Uses `THREE.Projector` or camera matrices for orthographic projection.

#### style.css
- Provides a minimal and clean layout for the viewer and controls.

---

## Dependencies

All dependencies can be imported via CDN or installed via NPM if using Vite.

Example (CDN import):

```html
<script type="module">
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { OCCLoader } from "https://cdn.jsdelivr.net/npm/occt-import-js@1.0.0/dist/occt-import.module.js";
import { DXFExporter } from "https://cdn.jsdelivr.net/npm/three-dxf@1.0.0/dist/three-dxf.module.js";
</script>
```

---

## Project Structure

```
step-to-dxf-viewer/
├── index.html
├── main.js
├── dxf-exporter.js
├── style.css
├── assets/
│   ├── logo.svg
│   └── demo.step
└── README.md
```

---

## Example Logic (Pseudocode)

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OCCLoader } from 'occt-import-js';
import { DXFExporter } from 'three-dxf';

let scene, camera, renderer, controls;

initScene();
setupUI();

async function loadSTEP(file) {
  const loader = new OCCLoader();
  const arrayBuffer = await file.arrayBuffer();
  const mesh = await loader.parse(arrayBuffer);
  scene.add(mesh);
}

function setViewTop() { camera.position.set(0, 100, 0); camera.lookAt(0, 0, 0); }
function setViewFront() { camera.position.set(0, 0, 100); camera.lookAt(0, 0, 0); }
function setViewRight() { camera.position.set(100, 0, 0); camera.lookAt(0, 0, 0); }
function setViewIso() { camera.position.set(100, 100, 100); camera.lookAt(0, 0, 0); }

function exportDXF() {
  const exporter = new DXFExporter();
  const dxf = exporter.parse(scene);
  downloadFile(dxf, 'projection.dxf', 'application/dxf');
}
```

---

## Orthographic Projection Setup

Use an orthographic camera to preserve scale and proportions when exporting technical views:

```js
const aspect = window.innerWidth / window.innerHeight;
camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.1, 1000);
camera.position.set(0, 0, 100); // Front view
camera.lookAt(0, 0, 0);
```

This ensures geometrically accurate 2D exports.

---

## File Download Helper

```js
function downloadFile(data, filename, mime) {
  const blob = new Blob([data], { type: mime });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
```

---

## Deployment on GitHub Pages

1. Create a new repository, e.g. `step-to-dxf-viewer`.  
2. Upload all static files (`index.html`, JS, CSS, assets).  
3. In GitHub:
   - Go to **Settings → Pages**.  
   - Set source: `main` branch, `/ (root)`.  
4. The application will be accessible at:  
   `https://<username>.github.io/step-to-dxf-viewer/`

---

## Future Extensions

| Feature | Description |
|----------|--------------|
| Kerf offset | Apply offset to 2D outlines for laser cutting |
| Layered DXF | Separate layers or colors by geometry type |
| Interactive measurement | Add measurement tools or annotations |
| 2D Preview | Show SVG preview before export |
| FabLab educational mode | Session-based tracking for students |

---

## Expected Result

A static web application that allows:
- Uploading local `.step` files  
- Real-time 3D visualization (orbit, zoom, pan)  
- Predefined camera projections (Top, Front, Right, Isometric)  
- Export of accurate 2D projections as DXF or SVG  
- Full operation in-browser, compatible with GitHub Pages
