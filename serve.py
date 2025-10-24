#!/usr/bin/env python3
"""
Simple HTTP server for testing the STEP to DXF viewer.
This is required because ES6 modules don't work with file:// protocol.
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

# Change to the script's directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

print(f"""
╔══════════════════════════════════════════════════════╗
║  STEP to DXF Web Viewer - Development Server        ║
╚══════════════════════════════════════════════════════╝

Starting server at http://localhost:{PORT}

Press Ctrl+C to stop the server.

Opening browser...
""")

# Open browser
webbrowser.open(f'http://localhost:{PORT}')

# Start server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
