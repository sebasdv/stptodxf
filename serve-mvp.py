#!/usr/bin/env python3
"""
Development server for MVP version
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

print(f"""
╔════════════════════════════════════════╗
║  3D Model to DXF Converter - MVP      ║
╚════════════════════════════════════════╝

Server: http://localhost:{PORT}

Opening: http://localhost:{PORT}/index-mvp.html

Press Ctrl+C to stop.
""")

webbrowser.open(f'http://localhost:{PORT}/index-mvp.html')

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
