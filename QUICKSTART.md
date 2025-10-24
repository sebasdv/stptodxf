# Quick Start Guide

## Running the Application

This application uses ES6 modules, which require a web server to run (you cannot simply open `index.html` in your browser).

### Fastest Way to Start

1. Open a terminal in the project directory
2. Run the server:
   ```bash
   python3 serve.py
   ```
3. Your browser will automatically open to `http://localhost:8000`

### Alternative: Manual Server Start

```bash
# Using Python
python3 -m http.server 8000

# OR using Node.js
npx http-server -p 8000
```

Then navigate to `http://localhost:8000` in your browser.

---

## Using the Application

1. **Upload a STEP file**
   - Click "Choose STEP File" button
   - OR drag and drop a `.step` or `.stp` file onto the viewer

2. **View the 3D model**
   - The model will appear in the 3D viewer
   - Use mouse to rotate, zoom, and pan:
     - Left click + drag: Rotate
     - Right click + drag: Pan
     - Scroll wheel: Zoom

3. **Switch Views**
   - Click view buttons to change perspective:
     - **Top**: Orthographic top view
     - **Front**: Orthographic front view
     - **Right**: Orthographic right view
     - **Isometric**: 3D perspective view

4. **Export 2D Projections**
   - Set the desired view first
   - Click **Export DXF** for CAD-compatible format
   - Click **Export SVG** for web/print-compatible format

---

## Troubleshooting

### "Cannot upload file"
- Make sure you're running the application from a web server (see above)
- Check browser console (F12) for error messages

### Module loading errors
- Ensure you have internet connection (required for CDN imports)
- Clear browser cache and reload

### File not loading
- Currently using placeholder geometry for demonstration
- Check that your file is a valid `.step` or `.stp` file
- Check browser console (F12) for detailed error messages

---

## Browser Compatibility

Tested with:
- Chrome/Edge (Recommended)
- Firefox
- Safari

Requires a modern browser with ES6 module support.
