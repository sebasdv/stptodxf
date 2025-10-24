# MVP Scope

## What We're Building
A 3D model viewer that can export 2D projections to DXF format.

## Core Features (MVP)
1. Upload 3D models (STL format - widely used, easy to parse)
2. View in 3D with orbit controls
3. Switch between orthographic views (Top, Front, Right)
4. Export current view as DXF file

## What's OUT of Scope (for now)
- ❌ STEP file parsing (too complex, requires WebAssembly library)
- ❌ SVG export (focus on DXF first)
- ❌ Isometric view (orthographic views only)
- ❌ Advanced features (kerf offset, layers, etc.)
- ❌ Placeholder geometry (use real uploaded files)

## Tech Stack
- Three.js for 3D rendering
- STLLoader (built into Three.js) for file parsing
- Custom DXF writer for export
- Pure frontend, no backend

## Success Criteria
- [ ] User can upload an STL file
- [ ] Model displays correctly in 3D viewer
- [ ] User can switch to Top/Front/Right views
- [ ] User can export current view as valid DXF file
- [ ] DXF opens correctly in CAD software
