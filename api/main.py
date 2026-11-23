"""
BB Bank Customer Churn DSS - FastAPI Server.
Provides high-performance, asynchronous REST APIs for Next.js Web Frontend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from api.routes import predict, dashboard, strategy, governance, batch

app = FastAPI(
    title="BB Bank - Churn DSS API",
    description="Enterprise Machine Learning & Retention Decision Support System REST API",
    version="2.4.0"
)

# Enable CORS for Next.js development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular routers
app.include_router(dashboard.router)
app.include_router(predict.router)
app.include_router(batch.router)
app.include_router(strategy.router)
app.include_router(governance.router)


@app.get("/health")
@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "system": "BB Bank Churn DSS",
        "version": "2.4.0",
        "certified": True,
        "model_loaded": True
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
