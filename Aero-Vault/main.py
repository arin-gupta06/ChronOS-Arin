from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
import os
import re

app = FastAPI(title="Aero-Vault")

VAULT_DIR = os.path.join(os.path.dirname(__file__), "vault")
os.makedirs(VAULT_DIR, exist_ok=True)

# Seed some default files
DEFAULT_FILES = {
    "welcome.md": """# Welcome to Aero-Vault 🛫

Your developer documentation hub is ready.

## Features
- **File Explorer**: Browse and manage your `.md` and `.sh` notes
- **Live Editor**: Write and edit with a VS Code-like experience
- **Preview Mode**: Toggle Markdown preview
- **Search**: Full-text search across all your notes
- **Snippets**: One-click copy for GCP, Git, Docker commands
- **URL Manager**: Store and label cloud asset URLs

## Getting Started
1. Create a new file using the `+` button in the Explorer
2. Write your notes in Markdown
3. Toggle Preview to see rendered output
4. Use Search to find anything instantly

> Built for developers, by developers.
""",
    "gcp-setup.md": """# GCP Deployment Guide

## Initial Setup

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

## Create a VM Instance

```bash
gcloud compute instances create my-vm \\
  --zone=us-central1-a \\
  --machine-type=e2-medium \\
  --image-family=debian-11 \\
  --image-project=debian-cloud \\
  --boot-disk-size=20GB
```

## SSH into VM

```bash
gcloud compute ssh my-vm --zone=us-central1-a
```

## Firewall Rules

```bash
# Allow HTTP
gcloud compute firewall-rules create allow-http \\
  --allow=tcp:80 --target-tags=http-server

# Allow HTTPS
gcloud compute firewall-rules create allow-https \\
  --allow=tcp:443 --target-tags=https-server
```

## Deploy to Cloud Run

```bash
gcloud run deploy my-service \\
  --image gcr.io/PROJECT_ID/my-image \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated
```
""",
    "docker-commands.sh": """#!/bin/bash
# Docker Essential Commands

# ── Build & Run ──────────────────────────────────────
# Build image from Dockerfile
docker build -t myapp:latest .

# Run container (detached, port mapped)
docker run -d -p 8080:8080 --name myapp myapp:latest

# Run with environment variables
docker run -d -p 8080:8080 \\
  -e DATABASE_URL=postgres://... \\
  -e SECRET_KEY=mysecret \\
  myapp:latest

# ── Container Management ─────────────────────────────
docker ps                        # List running containers
docker ps -a                     # List all containers
docker stop myapp                # Stop container
docker rm myapp                  # Remove container
docker logs -f myapp             # Follow logs
docker exec -it myapp /bin/bash  # Shell into container

# ── Image Management ─────────────────────────────────
docker images                    # List images
docker rmi myapp:latest          # Remove image
docker pull python:3.11-slim     # Pull from Docker Hub

# ── Docker Compose ───────────────────────────────────
docker compose up -d             # Start services
docker compose down              # Stop services
docker compose logs -f           # Follow all logs
docker compose ps                # Status of services

# ── Cleanup ──────────────────────────────────────────
docker system prune -af          # Remove all unused resources
docker volume prune              # Remove unused volumes
""",
    "dsa-notes.md": """# DSA Interview Prep — Google / Meta Style

## Arrays & Two Pointers

### Two Sum (HashMap approach)
```python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
# Time: O(n) | Space: O(n)
```

### Sliding Window — Max Subarray
```python
def max_subarray(nums):
    max_sum = current = nums[0]
    for num in nums[1:]:
        current = max(num, current + num)
        max_sum = max(max_sum, current)
    return max_sum
# Kadane's Algorithm — Time: O(n)
```

## Binary Search

```python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1
```

## Trees

### BFS (Level Order)
```python
from collections import deque
def level_order(root):
    if not root: return []
    result, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result
```

## Dynamic Programming

### Fibonacci (Memoized)
```python
def fib(n, memo={}):
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]
```

## Complexity Cheat Sheet

| Structure | Access | Search | Insert | Delete |
|-----------|--------|--------|--------|--------|
| Array     | O(1)   | O(n)   | O(n)   | O(n)   |
| HashMap   | O(1)   | O(1)   | O(1)   | O(1)   |
| BST       | O(log n)| O(log n)| O(log n)| O(log n)|
| Heap      | O(1)   | O(n)   | O(log n)| O(log n)|
""",
    "git-workflow.md": """# Git Workflow & Commands

## Daily Workflow

```bash
git status                        # Check status
git add .                         # Stage all changes
git add -p                        # Interactive staging
git commit -m "feat: add login"   # Commit
git push origin main              # Push
```

## Branching Strategy

```bash
# Create feature branch
git checkout -b feature/user-auth

# Sync with main
git fetch origin
git rebase origin/main

# Merge with squash
git checkout main
git merge --squash feature/user-auth
git commit -m "feat: user authentication"

# Delete branch
git branch -d feature/user-auth
git push origin --delete feature/user-auth
```

## Undoing Things

```bash
git reset --soft HEAD~1      # Undo last commit, keep changes staged
git reset --hard HEAD~1      # Undo last commit, discard changes
git restore file.py          # Discard unstaged changes
git stash                    # Stash current work
git stash pop                # Restore stash
```

## Git Log & Inspection

```bash
git log --oneline --graph --all   # Pretty tree log
git diff HEAD~1                   # Changes since last commit
git blame file.py                 # Who changed what
git bisect start                  # Binary search for bugs
```

## Conventional Commits

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code restructure
- `test:` Tests
- `chore:` Build/tooling
"""
}

for fname, content in DEFAULT_FILES.items():
    fpath = os.path.join(VAULT_DIR, fname)
    if not os.path.exists(fpath):
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)


class SaveRequest(BaseModel):
    filename: str
    content: str


class SearchResult(BaseModel):
    filename: str
    matches: list[str]
    line_numbers: list[int]


def search_vault(query: str) -> list[dict]:
    """Case-insensitive full-text search across all vault files."""
    results = []
    query_lower = query.lower()
    
    for fname in os.listdir(VAULT_DIR):
        if not (fname.endswith(".md") or fname.endswith(".sh")):
            continue
        fpath = os.path.join(VAULT_DIR, fname)
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                lines = f.readlines()
        except Exception:
            continue
        
        matches = []
        line_nums = []
        for i, line in enumerate(lines, 1):
            if query_lower in line.lower():
                matches.append(line.rstrip())
                line_nums.append(i)
        
        if matches:
            results.append({
                "filename": fname,
                "matches": matches[:5],  # cap at 5 snippets
                "line_numbers": line_nums[:5],
                "total_matches": len(matches)
            })
    
    return results


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    index_path = os.path.join(os.path.dirname(__file__), "static", "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.get("/api/files")
async def list_files():
    files = []
    for fname in sorted(os.listdir(VAULT_DIR)):
        if fname.endswith(".md") or fname.endswith(".sh"):
            fpath = os.path.join(VAULT_DIR, fname)
            size = os.path.getsize(fpath)
            files.append({"name": fname, "size": size})
    return {"files": files}


@app.get("/api/read/{filename}")
async def read_file(filename: str):
    # Sanitize filename
    filename = os.path.basename(filename)
    fpath = os.path.join(VAULT_DIR, filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail="File not found")
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    return {"filename": filename, "content": content}


@app.post("/api/save")
async def save_file(req: SaveRequest):
    filename = os.path.basename(req.filename)
    if not (filename.endswith(".md") or filename.endswith(".sh")):
        raise HTTPException(status_code=400, detail="Only .md and .sh files are allowed")
    fpath = os.path.join(VAULT_DIR, filename)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(req.content)
    return {"status": "saved", "filename": filename}


@app.delete("/api/delete/{filename}")
async def delete_file(filename: str):
    filename = os.path.basename(filename)
    fpath = os.path.join(VAULT_DIR, filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(fpath)
    return {"status": "deleted", "filename": filename}


@app.get("/api/search")
async def search_files(q: str):
    if not q or len(q.strip()) < 2:
        return {"results": [], "query": q}
    results = search_vault(q.strip())
    return {"results": results, "query": q, "total": len(results)}
