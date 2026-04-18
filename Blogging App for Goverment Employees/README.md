🏛️ GovGazette (GovBlog)

Blogging Platform for Government Employees

A lightweight blogging platform built with FastAPI + Jinja2 + SQLite, enabling government employees to securely create, manage, and discuss official blog/gazette posts.

---

🚀 Key Features

🔐 Authentication (Session-Based)

- Employee registration & login
- Secure session handling using SessionMiddleware
- Logout functionality

📝 Blog Management

- View all blogs (latest first)
- Create new blog posts (employees only)
- Edit/Delete posts (author-only permissions)

💬 Comments System

- View comments on each blog
- Add comments (employees only)

---

🛠️ Tech Stack

Layer| Technology
Backend| FastAPI
Templates| Jinja2
Database| SQLite + SQLAlchemy
Sessions| Starlette SessionMiddleware
Static Files| "/static" directory

---

📁 Project Structure

Blogging App for Goverment Employees/
│
├── main.py              # Core FastAPI application (routes + models)
├── templates/           # Jinja2 HTML templates
├── static/              # CSS, JS, and assets
├── models.py            # SQLAlchemy models (optional refactor)
├── database.py          # DB setup helpers (optional refactor)
├── requirements.txt     # Dependencies
├── README.md            # Documentation
└── LICENSE

«⚠️ Note: The folder name contains a typo — "Goverment" instead of "Government".»

---

⚙️ Requirements

- Python 3.9+
- pip

---

🧑‍💻 Setup & Run Locally

1. Navigate to project directory

cd "Blogging App for Goverment Employees"

2. Create virtual environment

macOS/Linux

python -m venv venv
source venv/bin/activate

Windows (PowerShell)

python -m venv venv
venv\Scripts\Activate.ps1

3. Install dependencies

pip install -r requirements.txt

4. Run the server

uvicorn main:app --reload --port 8000

5. Open in browser

http://localhost:8000

---

📌 Usage Guide

🧾 Register

- Go to: "/register"
- Enter details: name, contact, sector, position, password
- Auto-login after successful registration

🔑 Login

- Go to: "/login"
- Requires:
  - Employee ID (numeric)
  - Password

✍️ Create Blog

- Route: "/create-blog"
- Requires login

✏️ Edit/Delete Blog

- Route: "/blog/{blog_id}"
- Only visible to the author

💬 Comment

- Route: "/blog/{blog_id}"
- Logged-in users can comment

---

🌐 API Routes

Public Routes

Method| Route| Description
GET| "/"| Homepage (list blogs)
GET| "/login"| Login page
POST| "/login"| Login action
GET| "/register"| Register page
POST| "/register"| Register action
GET| "/blog/{blog_id}"| Blog details + comments

Protected Routes (Login Required)

Method| Route
GET| "/create-blog"
POST| "/create-blog"
GET| "/blog/{blog_id}/edit"
POST| "/blog/{blog_id}/edit"
POST| "/blog/{blog_id}/delete"
POST| "/blog/{blog_id}/comment"
POST| "/logout"

---

🗄️ Database

- File: "blog.db"
- Uses SQLite
- Tables auto-created on startup

---

📜 License

This project is licensed under the MIT License.

---

🤝 Contributing

Contributions are welcome!

You can:

- Improve UI/UX
- Enhance security
- Refactor backend
- Fix bugs or typos
- Add new features

Feel free to open issues or submit pull requests 🚀

---

💡 Future Improvements

- Role-based access control (Admin / Employee)
- Rich text editor for blogs
- Search & filtering
- Pagination
- REST API versioning
- Deployment (Docker + CI/CD)

---