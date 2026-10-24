# ResumeMatch — Smart Resume Matcher

ResumeMatch is a web application for analyzing resumes, identifying technical skills, comparing a resume against a job description, and discovering relevant job opportunities.

## Features

- PDF and DOCX resume text extraction.
- OCR fallback for scanned PDF pages (requires Tesseract OCR installed).
- Resume section and technical-skill detection.
- Resume quality analysis and improvement feedback.
- Job-description matching and skill-gap insights.
- Role-based job search through configured public job boards.
- Supabase email/password and Google authentication flows in the frontend.

> Matching and scoring are heuristic guidance, not a guarantee of ATS compatibility, interview selection, or employment.

## Technology stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Python, FastAPI, Pydantic
- **Authentication:** Supabase Auth
- **Resume processing:** PyMuPDF, python-docx, Pillow, pytesseract
- **Job search:** requests, configured Greenhouse/Lever public job boards

## Repository structure

```text
ResumeMatch/
├── backend/
│   ├── main.py
│   ├── job_search.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Auth.jsx
│   │   ├── Auth.css
│   │   ├── AuthGate.jsx
│   │   ├── AuthGate.css
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── supabase.js
│   ├── .env.example
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## Requirements

- Node.js and npm compatible with the Vite version in `frontend/package.json`
- Python 3.10+ (use a version supported by the installed dependencies)
- A Supabase project for authentication
- Tesseract OCR installed if you need OCR for scanned PDFs

## Run locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ResumeMatch
```

### 2. Start the backend

Windows PowerShell:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

macOS/Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend should be available at `http://127.0.0.1:8000`. Interactive API documentation is at `http://127.0.0.1:8000/docs`.

**OCR setup:** The backend uses Tesseract for scanned PDF pages. Install Tesseract for your operating system and set `TESSERACT_CMD` to its executable path if it is not discoverable automatically. Without Tesseract, text-based PDFs and DOCX files may still work, but scanned-page OCR may fail.

### 3. Configure and start the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env` and fill in your Supabase project values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_API_URL=http://127.0.0.1:8000
```

Then start Vite:

```bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

### 4. Supabase setup

In the Supabase dashboard:

1. Enable the authentication providers you intend to use (email/password and Google, if configured).
2. Configure the local development URL and the relevant callback/redirect URLs in the authentication URL settings.
3. For production, add the deployed frontend URL and configure provider-specific OAuth settings.

The frontend authentication gate is not, by itself, backend authorization. Before exposing protected user data or endpoints publicly, implement and verify server-side access-token validation and appropriate authorization.

## API routes

The FastAPI application currently defines these routes:

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/` | API information |
| `GET` | `/health` | Health check |
| `POST` | `/analyze` | Analyze an uploaded resume |
| `POST` | `/match-jobs` | Resume/job matching endpoint |
| `POST` | `/match-job` | Compare resume content with a job description |
| `GET` | `/jobs/roles` | List supported job roles |
| `GET` | `/jobs/search` | Search configured job sources |

For exact request fields and response formats, run the backend and visit `/docs`.

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL used by the frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key used by the frontend |
| `VITE_API_URL` | Base URL of the FastAPI backend |
| `TESSERACT_CMD` | Optional path to the Tesseract executable |

Do not commit `.env` files, private keys, service-role keys, passwords, tokens, or user resumes. Keep local values in your ignored `.env` file and document only variable names in `.env.example`.

## Current limitations and future work

- Add server-side Supabase token verification and endpoint authorization before production use.
- Confirm and expand job-board configurations; search results depend on configured public boards and source availability.
- Add automated tests for resume parsing, scoring, authentication flows, and API failure cases.
- Add persistent user-specific analysis history and saved jobs if desired.
- Configure production CORS and deployment environment variables before deploying.
- Add screenshots and a demo link once a deployment is available.

## Development commands

From `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## License

No license has been selected yet. Add a license before accepting reuse or external contributions under defined terms.
