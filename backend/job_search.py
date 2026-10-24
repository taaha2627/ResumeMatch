
import html
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/jobs", tags=["Job Search"])

# Configure only public job boards whose tokens/site names you have verified.
# Greenhouse: company name -> public board token
GREENHOUSE_BOARDS = {
    "Stripe": "stripe",
}

# Lever: company name -> public Lever site name
LEVER_SITES = {
    # "Example Company": "verified-lever-site-name",
}

ROLE_KEYWORDS = {
    "AI/ML Engineer": [
        "machine learning engineer",
        "ai engineer",
        "artificial intelligence engineer",
        "ml engineer",
        "ai/ml engineer",
    ],
    "Machine Learning Engineer": [
        "machine learning engineer",
        "ml engineer",
    ],
    "Data Analyst": [
        "data analyst",
        "business intelligence analyst",
        "bi analyst",
    ],
    "Data Scientist": [
        "data scientist",
        "applied scientist",
    ],
    "Full Stack Developer": [
        "full stack developer",
        "full-stack developer",
        "full stack engineer",
        "full-stack engineer",
    ],
    "Backend Developer": [
        "backend developer",
        "back-end developer",
        "backend engineer",
        "back-end engineer",
    ],
    "Software Engineer": [
        "software engineer",
        "software developer",
    ],
    "Computer Vision Engineer": [
        "computer vision engineer",
        "vision engineer",
        "perception engineer",
    ],
}


def clean_html(value):
    """Remove HTML markup and normalize whitespace."""
    value = re.sub(r"<[^>]+>", " ", value or "")
    value = html.unescape(value)
    return re.sub(r"\s+", " ", value).strip()


def request_json(url, params=None):
    """Perform an isolated request so worker threads share no Session."""
    response = requests.get(
        url,
        params=params,
        headers={"User-Agent": "ResumeMatchCareerStudio/2.0"},
        timeout=(5, 20),
    )
    response.raise_for_status()
    return response.json()


def get_greenhouse_jobs(company, token):
    url = f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs"
    payload = request_json(url, {"content": "true"})

    jobs = []
    for item in payload.get("jobs", []):
        location = item.get("location") or {}
        jobs.append({
            "id": f"greenhouse-{item.get('id')}",
            "title": item.get("title", ""),
            "company": company,
            "location": location.get("name", "Not specified"),
            "description": clean_html(item.get("content", "")),
            "source": "Greenhouse",
            "apply_url": item.get("absolute_url", ""),
        })
    return jobs


def get_lever_jobs(company, site):
    url = f"https://api.lever.co/v0/postings/{site}"
    payload = request_json(url, {"mode": "json", "limit": 100})

    jobs = []
    for item in payload if isinstance(payload, list) else []:
        categories = item.get("categories") or {}
        description = " ".join([
            item.get("descriptionPlain", ""),
            item.get("additionalPlain", ""),
            item.get("openingPlain", ""),
            item.get("descriptionBodyPlain", ""),
        ])

        jobs.append({
            "id": f"lever-{item.get('id')}",
            "title": item.get("text", ""),
            "company": company,
            "location": categories.get("location", "Not specified"),
            "description": clean_html(description),
            "source": "Lever",
            "apply_url": item.get("hostedUrl", ""),
        })
    return jobs


def normalize(value):
    return re.sub(r"\s+", " ", (value or "").lower()).strip()


def matches_role(job, role):
    title = normalize(job.get("title"))
    keywords = ROLE_KEYWORDS.get(role, [])
    return any(keyword in title for keyword in keywords)


def matches_location(job, location):
    requested = normalize(location)
    if not requested or requested in {"any", "all", "remote or any"}:
        return True

    actual = normalize(job.get("location"))
    if requested == "remote":
        return "remote" in actual

    # Allow a location such as "Hyderabad" to match
    # "Hyderabad, Telangana, India".
    return requested in actual


def fetch_all_jobs():
    """Fetch configured boards concurrently and retain source errors."""
    jobs = []
    errors = []

    tasks = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        for company, token in GREENHOUSE_BOARDS.items():
            tasks.append((
                company,
                executor.submit(get_greenhouse_jobs, company, token),
            ))

        for company, site in LEVER_SITES.items():
            tasks.append((
                company,
                executor.submit(get_lever_jobs, company, site),
            ))

        for company, future in tasks:
            try:
                jobs.extend(future.result())
            except (requests.RequestException, ValueError, TypeError) as exc:
                errors.append({
                    "company": company,
                    "message": str(exc)[:250],
                })

    # De-duplicate by application URL, falling back to provider ID.
    unique = {}
    for job in jobs:
        key = job.get("apply_url") or job.get("id")
        if key:
            unique[key] = job

    return list(unique.values()), errors


@router.get("/roles")
def supported_roles():
    """Return role choices for the frontend."""
    return {"roles": list(ROLE_KEYWORDS.keys())}


@router.get("/search")
def search_jobs(
    role: str = Query(..., min_length=1),
    location: str = Query("Any", max_length=120),
    company: str = Query("", max_length=120),
    limit: int = Query(50, ge=1, le=100),
):
    if role not in ROLE_KEYWORDS:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Unsupported role",
                "supported_roles": list(ROLE_KEYWORDS),
            },
        )

    if not GREENHOUSE_BOARDS and not LEVER_SITES:
        raise HTTPException(
            status_code=503,
            detail=(
                "No job boards are configured. Add verified public "
                "Greenhouse tokens or Lever site names in job_search.py."
            ),
        )

    jobs, source_errors = fetch_all_jobs()
    company_filter = normalize(company)

    filtered = [
        job for job in jobs
        if matches_role(job, role)
        and matches_location(job, location)
        and (
            not company_filter
            or company_filter in normalize(job.get("company"))
        )
    ]

    filtered.sort(
        key=lambda job: (
            normalize(job.get("company")),
            normalize(job.get("title")),
        )
    )

    return {
        "role": role,
        "location": location or "Any",
        "count": min(len(filtered), limit),
        "total_matching": len(filtered),
        "sources_checked": len(GREENHOUSE_BOARDS) + len(LEVER_SITES),
        "source_errors": source_errors,
        "jobs": filtered[:limit],
    }
