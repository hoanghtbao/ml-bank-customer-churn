"""
BB Bank — Churn DSS Fullstack Launcher
Launches both FastAPI backend (port 8000) and Next.js frontend (port 3000) concurrently.

Default mode (`python run_fullstack.py`): Hot-Reload / Auto-Update enabled for both
Next.js (`next dev`) and FastAPI (`uvicorn --reload`).
Production mode (`python run_fullstack.py --prod`): Runs optimized `next start` + FastAPI.
"""

import argparse
import os
import sys
import time
import subprocess

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")


def print_banner(prod_mode: bool):
    mode_label = "PRODUCTION SERVER" if prod_mode else "AUTO-RELOAD DEV MODE (Hot Refresh)"
    banner = rf"""
    ========================================================================
     BB BANK — ENTERPRISE CHURN DECISION SUPPORT SYSTEM
     Mode: {mode_label}
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


def stop_process_tree(proc: subprocess.Popen):
    """Terminate a process and all its child processes cleanly (Windows-safe)."""
    if proc.poll() is not None:
        return
    if os.name == "nt":
        subprocess.run(
            ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        proc.terminate()


def main():
    parser = argparse.ArgumentParser(description="BB Bank Churn DSS Fullstack Launcher")
    parser.add_argument(
        "--prod",
        action="store_true",
        help="Run in production mode (`next start`) instead of hot-reload dev mode (`next dev`).",
    )
    args = parser.parse_args()

    print_banner(args.prod)

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
        py_cmd = [
            sys.executable,
            "-m",
            "uvicorn",
            "api.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            "8000",
        ]
        if not args.prod:
            print("[1/2] Starting FastAPI backend (Hot-Reload) on http://127.0.0.1:8000 ...")
            py_cmd.extend(["--reload", "--reload-dir", "api", "--reload-dir", "src"])
        else:
            print("[1/2] Starting FastAPI backend on http://127.0.0.1:8000 ...")

        api_proc = subprocess.Popen(py_cmd, cwd=ROOT_DIR)
        processes.append(api_proc)

        # Wait 1.5s for API to bind
        time.sleep(1.5)

        # Start Next.js Frontend
        if args.prod:
            next_build_dir = os.path.join(FRONTEND_DIR, ".next")
            if not os.path.exists(next_build_dir):
                print("[INFO] Production build (.next) not found. Running `npm run build`...")
                subprocess.run("npm run build", cwd=FRONTEND_DIR, shell=True, check=True)
            npm_cmd = "npm run start -- -p 3000"
            mode = "Production Server"
        else:
            npm_cmd = "npm run dev -- -p 3000"
            mode = "Development Server - Auto-Reload Enabled"

        print(f"[2/2] Starting Next.js ({mode}) on http://localhost:3000 ...")
        frontend_proc = subprocess.Popen(npm_cmd, cwd=FRONTEND_DIR, shell=True)
        processes.append(frontend_proc)

        print("\n[SUCCESS] Both services are running! Open http://localhost:3000 in your browser.\n")

        # Keep running until Ctrl+C
        while True:
            for p in processes:
                if p.poll() is not None:
                    print(f"\n[NOTICE] Process {p.pid} terminated with exit code {p.returncode}")
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[INFO] Stopping BB Bank services gracefully...")
        for p in processes:
            try:
                stop_process_tree(p)
            except Exception:
                pass
        print("[DONE] Services stopped.")


if __name__ == "__main__":
    main()
