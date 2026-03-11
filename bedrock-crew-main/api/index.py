import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from app.main import app
except Exception as e:
    # Fallback: create minimal app that shows the error
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    import traceback
    
    app = FastAPI()
    
    error_msg = str(e)
    error_trace = traceback.format_exc()
    
    @app.get("/")
    @app.get("/{path:path}")
    @app.post("/{path:path}")
    async def error_handler(path: str = ""):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to import main app",
                "detail": error_msg,
                "traceback": error_trace,
                "path_attempted": os.path.join(os.path.dirname(__file__), '..', 'backend'),
                "sys_path": sys.path[:5]
            }
        )
