import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { exportDXF, exportSVG } from './dxf-exporter.js';

// Global variables
let scene, camera, renderer, controls;
let currentMesh = null;
let isOrthographic = false;

// DOM elements
const canvas = document.getElementById('canvas');
const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const status = document.getElementById('status');
const viewer = document.getElementById('viewer');

// Control buttons
const btnTop = document.getElementById('btnTop');
const btnFront = document.getElementById('btnFront');
const btnRight = document.getElementById('btnRight');
const btnIso = document.getElementById('btnIso');
const btnExportDXF = document.getElementById('btnExportDXF');
const btnExportSVG = document.getElementById('btnExportSVG');

// Initialize the 3D scene
function initScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xecf0f1);

    // Create perspective camera (will switch to orthographic for exports)
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 200); // Adjust for controls
    renderer.setPixelRatio(window.devicePixelRatio);

    // Add orbit controls
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(100, 100, 100);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-100, -100, -100);
    scene.add(directionalLight2);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(200, 20, 0x95a5a6, 0xbdc3c7);
    scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    // Start animation loop
    animate();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;

    if (camera.isPerspectiveCamera) {
        camera.aspect = aspect;
    } else {
        const frustumSize = 200;
        camera.left = -frustumSize * aspect / 2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
    }

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - 200);
});

// Load STEP file
async function loadSTEPFile(file) {
    try {
        updateStatus('Loading STEP file...');

        // For this demo, we'll create a simple parser simulation
        // In production, you would use occt-import-js here
        const arrayBuffer = await file.arrayBuffer();

        // Simulate STEP parsing with a placeholder geometry
        // Note: Real implementation would use OCCLoader from occt-import-js
        const geometry = createPlaceholderGeometry();
        const material = new THREE.MeshPhongMaterial({
            color: 0x3498db,
            flatShading: false,
            side: THREE.DoubleSide
        });

        // Remove previous mesh if exists
        if (currentMesh) {
            scene.remove(currentMesh);
        }

        currentMesh = new THREE.Mesh(geometry, material);
        scene.add(currentMesh);

        // Add wireframe
        const wireframe = new THREE.WireframeGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x2c3e50, linewidth: 1 });
        const wireframeMesh = new THREE.LineSegments(wireframe, lineMaterial);
        currentMesh.add(wireframeMesh);

        // Center camera on object
        fitCameraToObject(currentMesh);

        // Enable controls
        enableControls(true);

        updateStatus(`Loaded: ${file.name}`);
        dropzone.classList.add('hidden');

    } catch (error) {
        console.error('Error loading STEP file:', error);
        updateStatus(`Error: ${error.message}`);
    }
}

// Create placeholder geometry (simulates STEP file content)
// In production, this would be replaced by actual STEP parsing
function createPlaceholderGeometry() {
    // Create a more complex shape to demonstrate the viewer
    const group = new THREE.Group();

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(50, 30, 20);
    const body = new THREE.Mesh(bodyGeometry);
    group.add(body);

    // Cylinder on top
    const cylinderGeometry = new THREE.CylinderGeometry(10, 10, 40, 32);
    const cylinder = new THREE.Mesh(cylinderGeometry);
    cylinder.position.set(0, 35, 0);
    group.add(cylinder);

    // Merge geometries
    const mergedGeometry = new THREE.BufferGeometry();
    const geometries = [];

    group.updateMatrixWorld(true);
    group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            const geo = child.geometry.clone();
            geo.applyMatrix4(child.matrixWorld);
            geometries.push(geo);
        }
    });

    return THREE.BufferGeometryUtils ?
        THREE.BufferGeometryUtils.mergeGeometries(geometries) :
        bodyGeometry; // Fallback
}

// Fit camera to object
function fitCameraToObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 2.5; // Zoom out a bit

    camera.position.set(cameraZ, cameraZ, cameraZ);
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();
}

// Switch to orthographic camera
function switchToOrthographic() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 200;

    const orthoCamera = new THREE.OrthographicCamera(
        -frustumSize * aspect / 2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        -frustumSize / 2,
        0.1,
        10000
    );

    orthoCamera.position.copy(camera.position);
    orthoCamera.rotation.copy(camera.rotation);

    camera = orthoCamera;
    controls.object = camera;
    isOrthographic = true;
}

// Switch to perspective camera
function switchToPerspective() {
    const aspect = window.innerWidth / window.innerHeight;
    const perspCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);

    perspCamera.position.copy(camera.position);
    perspCamera.rotation.copy(camera.rotation);

    camera = perspCamera;
    controls.object = camera;
    isOrthographic = false;
}

// View presets
function setViewTop() {
    if (!isOrthographic) switchToOrthographic();

    if (currentMesh) {
        const box = new THREE.Box3().setFromObject(currentMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.z);

        camera.position.set(center.x, center.y + maxDim * 2, center.z);
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
    }

    updateStatus('View: Top (Orthographic)');
}

function setViewFront() {
    if (!isOrthographic) switchToOrthographic();

    if (currentMesh) {
        const box = new THREE.Box3().setFromObject(currentMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y);

        camera.position.set(center.x, center.y, center.z + maxDim * 2);
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
    }

    updateStatus('View: Front (Orthographic)');
}

function setViewRight() {
    if (!isOrthographic) switchToOrthographic();

    if (currentMesh) {
        const box = new THREE.Box3().setFromObject(currentMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.y, size.z);

        camera.position.set(center.x + maxDim * 2, center.y, center.z);
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
    }

    updateStatus('View: Right (Orthographic)');
}

function setViewIso() {
    switchToPerspective();

    if (currentMesh) {
        const box = new THREE.Box3().setFromObject(currentMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        camera.position.set(
            center.x + maxDim * 1.5,
            center.y + maxDim * 1.5,
            center.z + maxDim * 1.5
        );
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
    }

    updateStatus('View: Isometric');
}

// Enable/disable controls
function enableControls(enabled) {
    btnTop.disabled = !enabled;
    btnFront.disabled = !enabled;
    btnRight.disabled = !enabled;
    btnIso.disabled = !enabled;
    btnExportDXF.disabled = !enabled;
    btnExportSVG.disabled = !enabled;
}

// Update status message
function updateStatus(message) {
    status.textContent = message;
}

// File input handler
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadSTEPFile(file);
    }
});

// Drag and drop handlers
viewer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    viewer.style.background = '#d5dbdb';
});

viewer.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    viewer.style.background = '';
});

viewer.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    viewer.style.background = '';

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.step') || file.name.endsWith('.stp'))) {
        loadSTEPFile(file);
    } else {
        updateStatus('Error: Please drop a .step or .stp file');
    }
});

// View button handlers
btnTop.addEventListener('click', setViewTop);
btnFront.addEventListener('click', setViewFront);
btnRight.addEventListener('click', setViewRight);
btnIso.addEventListener('click', setViewIso);

// Export button handlers
btnExportDXF.addEventListener('click', () => {
    if (currentMesh) {
        updateStatus('Exporting DXF...');
        exportDXF(scene, camera);
        updateStatus('DXF exported successfully');
    }
});

btnExportSVG.addEventListener('click', () => {
    if (currentMesh) {
        updateStatus('Exporting SVG...');
        exportSVG(scene, camera);
        updateStatus('SVG exported successfully');
    }
});

// Initialize scene on page load
initScene();
updateStatus('Ready - No file loaded');
