# 3D Model to DXF Converter - MVP

## What This Does

Upload an STL file, view it in 3D, and export 2D projections as DXF files.

That's it. No complexity, no promises we can't keep.

## Quick Start

1. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open `http://localhost:8000/index-mvp.html`

3. Upload `test-cube.stl` (included) or your own STL file

4. Switch views (Top/Front/Right) and export DXF

## What Works

- ✓ STL file upload (ASCII and Binary formats)
- ✓ 3D visualization with orbit controls
- ✓ Orthographic camera views (Top, Front, Right)
- ✓ DXF export of current view
- ✓ Drag and drop file upload
- ✓ Works in any modern browser
- ✓ No backend required

## What Doesn't Work (Yet)

- ✗ STEP file support (not implemented)
- ✗ SVG export (use DXF for now)
- ✗ Isometric view (orthographic only)
- ✗ Advanced features (layers, colors, etc.)

## Why STL Instead of STEP?

STEP parsing requires a complex WebAssembly library (occt-import-js). STL is:
- Simple to parse
- Widely supported
- Works with Three.js built-in loader
- Good enough for MVP

We can add STEP support later if needed.

## Files

- `index-mvp.html` - Main application
- `main-mvp.js` - All functionality in one file
- `test-cube.stl` - Sample file for testing

## Testing

1. Load `test-cube.stl`
2. You should see a 10x10x10 cube
3. Click "Top View" - you should see a square
4. Click "Export DXF"
5. Open the DXF in any CAD software
6. Verify the square appears correctly

## Browser Console

Open browser console (F12) to see any errors.

## Known Limitations

- DXF export creates line segments from triangle edges
- No hidden line removal (all edges are exported)
- Limited to orthographic projections
- File size affects performance

## Tech Stack

- Three.js r160 (3D rendering)
- STLLoader (file parsing)
- Custom DXF writer
- Pure ES6 modules

## License

Public domain - do whatever you want with this.
