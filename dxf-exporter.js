import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/**
 * Export scene as DXF file
 * Converts 3D geometry to 2D projection based on current camera view
 */
export function exportDXF(scene, camera) {
    const dxfContent = generateDXFContent(scene, camera);
    downloadFile(dxfContent, 'projection.dxf', 'application/dxf');
}

/**
 * Export scene as SVG file
 * Converts 3D geometry to 2D projection based on current camera view
 */
export function exportSVG(scene, camera) {
    const svgContent = generateSVGContent(scene, camera);
    downloadFile(svgContent, 'projection.svg', 'image/svg+xml');
}

/**
 * Generate DXF file content from scene
 */
function generateDXFContent(scene, camera) {
    const lines = extractLines(scene, camera);

    // DXF header
    let dxf = '0\nSECTION\n2\nHEADER\n';
    dxf += '9\n$ACADVER\n1\nAC1015\n'; // AutoCAD 2000 format
    dxf += '9\n$INSUNITS\n70\n4\n'; // Millimeters
    dxf += '0\nENDSEC\n';

    // Tables section
    dxf += '0\nSECTION\n2\nTABLES\n';

    // Layer table
    dxf += '0\nTABLE\n2\nLAYER\n70\n1\n';
    dxf += '0\nLAYER\n2\n0\n70\n0\n62\n7\n6\nCONTINUOUS\n';
    dxf += '0\nENDTAB\n';

    dxf += '0\nENDSEC\n';

    // Entities section
    dxf += '0\nSECTION\n2\nENTITIES\n';

    // Add lines
    lines.forEach(line => {
        dxf += '0\nLINE\n';
        dxf += '8\n0\n'; // Layer
        dxf += `10\n${line.start.x.toFixed(6)}\n`; // X start
        dxf += `20\n${line.start.y.toFixed(6)}\n`; // Y start
        dxf += `30\n0.0\n`; // Z start (always 0 for 2D projection)
        dxf += `11\n${line.end.x.toFixed(6)}\n`; // X end
        dxf += `21\n${line.end.y.toFixed(6)}\n`; // Y end
        dxf += `31\n0.0\n`; // Z end (always 0 for 2D projection)
    });

    dxf += '0\nENDSEC\n';
    dxf += '0\nEOF\n';

    return dxf;
}

/**
 * Generate SVG file content from scene
 */
function generateSVGContent(scene, camera) {
    const lines = extractLines(scene, camera);

    if (lines.length === 0) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"></svg>';
    }

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    lines.forEach(line => {
        minX = Math.min(minX, line.start.x, line.end.x);
        minY = Math.min(minY, line.start.y, line.end.y);
        maxX = Math.max(maxX, line.start.x, line.end.x);
        maxY = Math.max(maxY, line.start.y, line.end.y);
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const padding = Math.max(width, height) * 0.1;

    const viewBoxWidth = width + 2 * padding;
    const viewBoxHeight = height + 2 * padding;
    const viewBoxX = minX - padding;
    const viewBoxY = minY - padding;

    // SVG header
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}">
  <g stroke="black" stroke-width="${Math.max(width, height) * 0.002}" fill="none">
`;

    // Add lines
    lines.forEach(line => {
        // Flip Y coordinate for SVG (SVG Y axis goes down, but our projection goes up)
        const y1 = -line.start.y;
        const y2 = -line.end.y;

        svg += `    <line x1="${line.start.x.toFixed(3)}" y1="${y1.toFixed(3)}" x2="${line.end.x.toFixed(3)}" y2="${y2.toFixed(3)}" />\n`;
    });

    svg += '  </g>\n</svg>';

    return svg;
}

/**
 * Extract visible lines from scene based on camera projection
 */
function extractLines(scene, camera) {
    const lines = [];
    const projectedVertices = new Map();

    // Process all meshes in the scene
    scene.traverse((object) => {
        if (object.isMesh && object.geometry) {
            const geometry = object.geometry;
            const worldMatrix = object.matrixWorld;

            // Get position attribute
            const positions = geometry.attributes.position;
            if (!positions) return;

            // Get index or create sequential indices
            const indices = geometry.index ? geometry.index.array : null;
            const vertexCount = positions.count;

            // Project vertices
            const projected = [];
            for (let i = 0; i < vertexCount; i++) {
                const vertex = new THREE.Vector3(
                    positions.getX(i),
                    positions.getY(i),
                    positions.getZ(i)
                );

                // Apply world matrix
                vertex.applyMatrix4(worldMatrix);

                // Project to camera space
                const projected2D = projectVertex(vertex, camera);
                projected.push(projected2D);
            }

            // Extract edges
            if (indices) {
                // Use indices to create triangles
                for (let i = 0; i < indices.length; i += 3) {
                    const i1 = indices[i];
                    const i2 = indices[i + 1];
                    const i3 = indices[i + 2];

                    // Add three edges of the triangle
                    addUniqueEdge(lines, projected[i1], projected[i2]);
                    addUniqueEdge(lines, projected[i2], projected[i3]);
                    addUniqueEdge(lines, projected[i3], projected[i1]);
                }
            } else {
                // No indices, assume sequential triangles
                for (let i = 0; i < vertexCount; i += 3) {
                    if (i + 2 < vertexCount) {
                        addUniqueEdge(lines, projected[i], projected[i + 1]);
                        addUniqueEdge(lines, projected[i + 1], projected[i + 2]);
                        addUniqueEdge(lines, projected[i + 2], projected[i]);
                    }
                }
            }
        }
    });

    return lines;
}

/**
 * Project 3D vertex to 2D using camera
 */
function projectVertex(vertex, camera) {
    const projected = vertex.clone();
    projected.project(camera);

    // Convert from NDC (-1 to 1) to a reasonable coordinate system (scale by 100)
    return {
        x: projected.x * 100,
        y: projected.y * 100,
        z: projected.z // Keep z for potential depth sorting
    };
}

/**
 * Add edge to lines array, avoiding duplicates
 */
function addUniqueEdge(lines, v1, v2) {
    const epsilon = 0.01;

    // Check if this edge already exists (in either direction)
    const exists = lines.some(line =>
        (Math.abs(line.start.x - v1.x) < epsilon &&
         Math.abs(line.start.y - v1.y) < epsilon &&
         Math.abs(line.end.x - v2.x) < epsilon &&
         Math.abs(line.end.y - v2.y) < epsilon) ||
        (Math.abs(line.start.x - v2.x) < epsilon &&
         Math.abs(line.start.y - v2.y) < epsilon &&
         Math.abs(line.end.x - v1.x) < epsilon &&
         Math.abs(line.end.y - v1.y) < epsilon)
    );

    if (!exists) {
        lines.push({
            start: { x: v1.x, y: v1.y },
            end: { x: v2.x, y: v2.y }
        });
    }
}

/**
 * Download file helper
 */
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
