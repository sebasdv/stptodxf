import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/STLLoader.js';

// Global state
let scene, camera, renderer, controls;
let currentMesh = null;

// DOM elements
let canvas, fileInput, dropzone, status, viewer;
let btnTop, btnFront, btnRight, btnExportDXF;

// Initialize DOM elements
function initDOM() {
    canvas = document.getElementById('canvas');
    fileInput = document.getElementById('fileInput');
    dropzone = document.getElementById('dropzone');
    status = document.getElementById('status');
    viewer = document.getElementById('viewer');
    btnTop = document.getElementById('btnTop');
    btnFront = document.getElementById('btnFront');
    btnRight = document.getElementById('btnRight');
    btnExportDXF = document.getElementById('btnExportDXF');

    if (!canvas || !fileInput) {
        console.error('Required DOM elements not found');
        return false;
    }
    return true;
}

// Initialize 3D scene
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Orthographic camera for accurate projections
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 100;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
    );
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 150);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Controls
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);

    // Grid
    const grid = new THREE.GridHelper(200, 20, 0x888888, 0xcccccc);
    scene.add(grid);

    // Axes
    const axes = new THREE.AxesHelper(50);
    scene.add(axes);

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
    const frustumSize = 100;

    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight - 150);
});

// Load STL file
function loadSTLFile(file) {
    updateStatus('Loading STL file...');

    const loader = new STLLoader();
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const geometry = loader.parse(e.target.result);

            // Remove old mesh
            if (currentMesh) {
                scene.remove(currentMesh);
            }

            // Create mesh
            const material = new THREE.MeshPhongMaterial({
                color: 0x3498db,
                flatShading: false
            });
            currentMesh = new THREE.Mesh(geometry, material);

            // Add edges for better visibility
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
            currentMesh.add(line);

            scene.add(currentMesh);

            // Center and fit camera
            fitCameraToModel();

            // Enable controls
            enableControls(true);

            dropzone.classList.add('hidden');
            updateStatus(`Loaded: ${file.name} (${geometry.attributes.position.count} vertices)`);

        } catch (error) {
            console.error('Error loading STL:', error);
            updateStatus('Error: Failed to load STL file');
        }
    };

    reader.onerror = function() {
        updateStatus('Error: Failed to read file');
    };

    reader.readAsArrayBuffer(file);
}

// Fit camera to model
function fitCameraToModel() {
    if (!currentMesh) return;

    const box = new THREE.Box3().setFromObject(currentMesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);

    // Update camera frustum to fit model
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = maxDim * 1.5;

    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();

    controls.target.copy(center);
    controls.update();
}

// View presets
function setTopView() {
    if (!currentMesh) return;

    const box = new THREE.Box3().setFromObject(currentMesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    camera.position.set(center.x, center.y + size.y * 2, center.z);
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();

    updateStatus('View: Top (Orthographic)');
}

function setFrontView() {
    if (!currentMesh) return;

    const box = new THREE.Box3().setFromObject(currentMesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    camera.position.set(center.x, center.y, center.z + size.z * 2);
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();

    updateStatus('View: Front (Orthographic)');
}

function setRightView() {
    if (!currentMesh) return;

    const box = new THREE.Box3().setFromObject(currentMesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    camera.position.set(center.x + size.x * 2, center.y, center.z);
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();

    updateStatus('View: Right (Orthographic)');
}

// Export to DXF
function exportDXF() {
    if (!currentMesh) return;

    updateStatus('Generating DXF...');

    try {
        const dxf = generateDXF();
        downloadFile(dxf, 'model.dxf', 'application/dxf');
        updateStatus('DXF exported successfully');
    } catch (error) {
        console.error('DXF export error:', error);
        updateStatus('Error: DXF export failed');
    }
}

// Generate DXF file content
function generateDXF() {
    const lines = extractEdges();

    let dxf = '';

    // Header
    dxf += '0\nSECTION\n2\nHEADER\n';
    dxf += '9\n$ACADVER\n1\nAC1015\n';
    dxf += '9\n$INSUNITS\n70\n4\n';
    dxf += '0\nENDSEC\n';

    // Tables
    dxf += '0\nSECTION\n2\nTABLES\n';
    dxf += '0\nTABLE\n2\nLAYER\n70\n1\n';
    dxf += '0\nLAYER\n2\n0\n70\n0\n62\n7\n6\nCONTINUOUS\n';
    dxf += '0\nENDTAB\n0\nENDSEC\n';

    // Entities
    dxf += '0\nSECTION\n2\nENTITIES\n';

    lines.forEach(line => {
        dxf += '0\nLINE\n8\n0\n';
        dxf += `10\n${line.start.x.toFixed(6)}\n`;
        dxf += `20\n${line.start.y.toFixed(6)}\n`;
        dxf += `30\n0.0\n`;
        dxf += `11\n${line.end.x.toFixed(6)}\n`;
        dxf += `21\n${line.end.y.toFixed(6)}\n`;
        dxf += `31\n0.0\n`;
    });

    dxf += '0\nENDSEC\n0\nEOF\n';

    return dxf;
}

// Extract visible edges from current view
function extractEdges() {
    if (!currentMesh) return [];

    const edges = [];
    const geometry = currentMesh.geometry;
    const worldMatrix = currentMesh.matrixWorld;

    if (!geometry.index) {
        geometry.setIndex(Array.from({ length: geometry.attributes.position.count }, (_, i) => i));
    }

    const positions = geometry.attributes.position;
    const index = geometry.index;

    // Project all vertices
    const projected = [];
    for (let i = 0; i < positions.count; i++) {
        const v = new THREE.Vector3(
            positions.getX(i),
            positions.getY(i),
            positions.getZ(i)
        );
        v.applyMatrix4(worldMatrix);
        v.project(camera);
        projected.push({ x: v.x * 100, y: v.y * 100 });
    }

    // Extract triangle edges
    const edgeSet = new Set();
    for (let i = 0; i < index.count; i += 3) {
        const i0 = index.getX(i);
        const i1 = index.getX(i + 1);
        const i2 = index.getX(i + 2);

        addEdge(edgeSet, edges, projected[i0], projected[i1]);
        addEdge(edgeSet, edges, projected[i1], projected[i2]);
        addEdge(edgeSet, edges, projected[i2], projected[i0]);
    }

    return edges;
}

// Add unique edge
function addEdge(edgeSet, edges, p1, p2) {
    const key = `${p1.x.toFixed(3)},${p1.y.toFixed(3)}-${p2.x.toFixed(3)},${p2.y.toFixed(3)}`;
    const reverseKey = `${p2.x.toFixed(3)},${p2.y.toFixed(3)}-${p1.x.toFixed(3)},${p1.y.toFixed(3)}`;

    if (!edgeSet.has(key) && !edgeSet.has(reverseKey)) {
        edgeSet.add(key);
        edges.push({ start: p1, end: p2 });
    }
}

// Download file
function downloadFile(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Enable/disable controls
function enableControls(enabled) {
    btnTop.disabled = !enabled;
    btnFront.disabled = !enabled;
    btnRight.disabled = !enabled;
    btnExportDXF.disabled = !enabled;
}

// Update status
function updateStatus(message) {
    if (status) {
        status.textContent = message;
    }
}

// Set up event handlers
function initEvents() {
    // File input
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            loadSTLFile(file);
        }
    });

    // Drag and drop
    viewer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    viewer.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files[0];
        if (file && file.name.toLowerCase().endsWith('.stl')) {
            loadSTLFile(file);
        } else {
            updateStatus('Error: Please drop an STL file');
        }
    });

    // View buttons
    btnTop.addEventListener('click', setTopView);
    btnFront.addEventListener('click', setFrontView);
    btnRight.addEventListener('click', setRightView);

    // Export button
    btnExportDXF.addEventListener('click', exportDXF);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (!initDOM()) {
        console.error('DOM initialization failed');
        return;
    }

    initScene();
    initEvents();
    updateStatus('Ready - Upload an STL file to begin');
});
