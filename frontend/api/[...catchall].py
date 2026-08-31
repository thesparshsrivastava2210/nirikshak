import sys
import os

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from main import app as app
except ImportError:
    backend_alt = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
    if backend_alt not in sys.path:
        sys.path.insert(0, backend_alt)
    from main import app as app
