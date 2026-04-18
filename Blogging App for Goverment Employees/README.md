```markdown
# GovGazette (GovBlog) — Blogging App for Government Employees

A lightweight blogging platform built with **FastAPI + Jinja2 templates + SQLite**. Government employees can **register/login**, then **create, edit, and delete** official blog/gazette posts. Logged-in employees can also **comment** on posts.

[![FastAPI](https://img.shields.io/badge/FastAPI-Modern%20Fast%20API-blue)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9%2B-orange)](https://www.python.org/)

> Note: The folder name in this repo is currently **`Blogging App for Goverment Employees`** (misspelling of “Government”). This README matches the current repo structure.

---

## Features

### Employee authentication (Session-based)
- Employee **registration** and **login**
- Session management using Starlette **SessionMiddleware**
- **Logout** clears the session

### Blog management
- View all blogs on the homepage (latest first)
- Create a blog post (**employees only**)
- Edit a blog post (**only the author**)
- Delete a blog post (**only the author**)

### Comments
- View comments on each blog post
- Add comments (**employees only**)

---

## Tech Stack
- **Backend:** FastAPI
- **Templates:** Jinja2 (`Jinja2Templates`)
- **Database:** SQLite + SQLAlchemy ORM
- **Sessions:** Starlette `SessionMiddleware`
- **Static files:** served from `/static`

---

## Project Structure
```text
Blogging App for Goverment Employees/
├── main.py                 # FastAPI app (routes + DB + models are defined here)
├── templates/              # Jinja2 HTML templates
├── static/                 # CSS/JS assets
├── requirements.txt        # Python dependencies
├── README.md               # Documentation
├── models.py               # SQLAlchemy models (optional/for refactor)
├── database.py             # DB setup helpers (optional/for refactor)
└── LICENSE
```

---

## Requirements
- Python **3.9+**
- pip

---

## Setup & Run Locally

### 1) Navigate to the project folder
```bash
cd "Blogging App for Goverment Employees"
```

### 2) Create and activate a virtual environment
**macOS/Linux**
```bash
python -m venv venv
source venv/bin/activate
```

**Windows (PowerShell)**
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

### 3) Install dependencies
```bash
pip install -r requirements.txt
```

### 4) Run the application
```bash
uvicorn main:app --reload --port 8000
```

Open:
- http://localhost:8000

---

## How to Use

### Register (Employee)
1. Visit: `/register`
2. Fill in: name, contact, sector, position, password
3. After successful registration, you are logged in automatically.

### Login
1. Visit: `/login`
2. Login uses:
   - **Employee ID** (numeric)
   - Password

### Create a Blog Post
- Visit: `/create-blog` (must be logged in)

### Edit or Delete a Blog Post
- Visit a blog detail page: `/blog/{blog_id}`
- Edit/Delete options appear only for the blog author.

### Comment on a Blog Post
- Visit: `/blog/{blog_id}`
- Logged-in employees can post a comment.

---

## Routes

### Public
- `GET /` — Home page (list blogs)
- `GET /login` — Login page
- `POST /login` — Login submission
- `GET /register` — Register page
- `POST /register` — Register submission
- `GET /blog/{blog_id}` — Blog detail + comments list

### Requires employee session
- `GET /create-blog`
- `POST /create-blog`
- `GET /blog/{blog_id}/edit`
- `POST /blog/{blog_id}/edit`
- `POST /blog/{blog_id}/delete`
- `POST /blog/{blog_id}/comment`
- `POST /logout`

---

## Database
- SQLite database file: **`blog.db`**
- Tables are created automatically at startup.

---

## License
MIT License (see `LICENSE`).

---

## Contributing
Contributions are welcome. Feel free to open issues or submit pull requests to improve features, security, UI consistency, or documentation.
```