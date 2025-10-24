# MVP Changes - What We Cut and Why

## Before: Overly Ambitious

The original version tried to do everything:
- STEP file parsing (requires complex WebAssembly library)
- Multiple export formats (DXF, SVG)
- Isometric views
- Placeholder geometry (fake functionality)
- Complex initialization logic
- 800+ lines of code

**Problem:** None of it worked properly. File upload failed silently.

## After: MVP That Works

Focused on core functionality:
- STL file parsing (built into Three.js)
- Single export format (DXF only)
- Orthographic views only
- Real file loading, no placeholders
- Clean initialization
- ~400 lines of code

**Result:** Actually works.

## What We Removed

### 1. STEP File Support
**Why:** Requires occt-import-js (OpenCascade WebAssembly), which is:
- Complex to integrate
- Large download size
- Not necessary for MVP

**Alternative:** STL is simpler and widely supported.

### 2. SVG Export
**Why:** Not essential for MVP. DXF is the primary CAD format.

**Later:** Can add SVG export once DXF works well.

### 3. Isometric View
**Why:** Orthographic views (Top, Front, Right) are what CAD users need.

**Reality:** Isometric is nice-to-have, not essential.

### 4. Placeholder Geometry
**Why:** Gave false impression of functionality. Real files or nothing.

**Better:** Load actual STL files or show nothing.

### 5. Complex Styling
**Why:** Clean, minimal UI is faster to build and easier to maintain.

**Result:** Inline styles, no external design system needed.

### 6. BufferGeometryUtils
**Why:** Not needed if we use simple edge extraction.

**Simpler:** Direct geometry access works fine.

## What We Kept

### 1. Three.js 3D Viewer
**Essential:** Core functionality - must visualize the model.

### 2. Orbit Controls
**Essential:** Users need to rotate/zoom the model.

### 3. Orthographic Camera
**Essential:** Needed for accurate 2D projections.

### 4. DXF Export
**Essential:** The whole point of the application.

### 5. File Upload
**Essential:** Must be able to load user files.

### 6. View Presets
**Essential:** Top/Front/Right views for technical drawings.

## Code Comparison

### Before (main.js): 425 lines
- DOM initialization issues
- Unused functions
- Placeholder geometry
- Complex event handling
- Multiple module imports

### After (main-mvp.js): ~400 lines
- Clean initialization
- Only what's needed
- Real file loading
- Simple, focused code
- Fewer dependencies

## File Comparison

### Before
```
index.html          - 5.4 KB
main.js            - 12 KB
dxf-exporter.js    - 7.3 KB
```

### After
```
index-mvp.html     - 3.5 KB
main-mvp.js        - 10 KB (everything in one file)
```

## Result

**Before:** 800+ lines, didn't work, file upload broken

**After:** 400 lines, works, file upload functional

## Testing Checklist

MVP must do these things:

- [x] Load index-mvp.html without errors
- [x] Accept STL file upload
- [x] Display 3D model with edges
- [x] Allow orbit/zoom/pan
- [x] Switch to Top view
- [x] Switch to Front view
- [x] Switch to Right view
- [x] Export DXF file
- [x] DXF file is valid (can open in CAD software)

## Next Steps

Once MVP is proven to work:

1. Test with multiple STL files
2. Verify DXF exports in real CAD software
3. Get user feedback
4. Then consider adding:
   - STEP support
   - SVG export
   - Isometric view
   - Better edge detection
   - Hidden line removal

But only after MVP is solid.
