"""
EuroVanguard Bank — Churn DSS Fullstack Launcher
Launches both FastAPI backend (port 8000) and Next.js frontend (port 3000) concurrently.
"""

import os
import sys
import time
import subprocess
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def print_banner():
    banner = r"""
    ========================================================================
     EUROVANGUARD BANK — ENTERPRISE CHURN DECISION SUPPORT SYSTEM
    ========================================================================
     [UI/UX] Modern Next.js 16 (App Router + Tailwind CSS + Recharts)
     [ENGINE] Python FastAPI + Uvicorn + XGBoost Early Warning Pipeline
    ------------------------------------------------------------------------
      >> Web Application UI:    http://localhost:3000
      >> Interactive API Docs:  http://127.0.0.1:8000/docs
      >> Health Check:          http://127.0.0.1:8000/health
    ------------------------------------------------------------------------
     Press CTRL + C to stop all services cleanly.
    ========================================================================
    """
    print(banner)

def main():
    print_banner()

    # 1. Check directories
    if not os.path.exists(FRONTEND_DIR):
        print(f"[ERROR] Frontend directory not found at: {FRONTEND_DIR}")
        sys.exit(1)

    node_modules = os.path.join(FRONTEND_DIR, "node_modules")
    if not os.path.exists(node_modules):
        print("[INFO] Installing frontend dependencies (npm install)...")
        subprocess.run(["npm", "install"], cwd=FRONTEND_DIR, shell=True, check=True)

    processes = []
    try:
        # Start FastAPI Backend
        print("[1/2] Starting FastAPI backend on http://127.0.0.1:8000 ...")
        py_cmd = [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "127.0.0.1", "--port", "8000"]
        api_proc = subprocess.Popen(py_cmd, cwd=ROOT_DIR)
        processes.append(api_proc)

        # Wait 1.5s for API to bind
        time.sleep(1.5)

        # Check if production build exists
        next_build_dir = os.path.join(FRONTEND_DIR, ".next")
        if os.path.exists(next_build_dir):
            npm_cmd = "npm run start -- -p 3000"
            mode = "Production Server"
        else:
            npm_cmd = "npm run dev -- -p 3000"
            mode = "Development Server"

        # Start Next.js Frontend
        print(f"[2/2] Starting Next.js ({mode}) on http://localhost:3000 ...")
        frontend_proc = subprocess.Popen(npm_cmd, cwd=FRONTEND_DIR, shell=True)
        processes.append(frontend_proc)

        print("\n[SUCCESS] Both services are running! Open http://localhost:3000 in your browser.\n")

        # Keep running until Ctrl+C
        while True:
            for p in processes:
                if p.poll() is not None:
                    # One of the processes exited
                    print(f"\n[NOTICE] Process {p.pid} terminated with exit code {p.returncode}")
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[INFO] Stopping EuroVanguard services gracefully...")
        for p in processes:
            try:
                p.terminate()
            except Exception:
                pass
        print("[DONE] Services stopped.")

if __name__ == "__main__":
    main()
