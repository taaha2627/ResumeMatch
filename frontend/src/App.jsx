
import { useState } from "react";
import "./App.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

async function fetchJSON(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(
      "Could not connect to the backend. Start FastAPI and check VITE_API_URL."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.detail;
    const message =
      typeof detail === "string"
        ? detail
        : detail?.message || `Request failed (${response.status}).`;
    throw new Error(message);
  }

  return data;
}

function getArray(data, keys) {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

function getScore(data) {
  const raw =
    data?.match_score ??
    data?.match_percentage ??
    data?.score;

  if (raw === undefined || raw === null || raw === "") return null;

  const value = Number(raw);
  if (!Number.isFinite(value)) return null;

  return Math.round(Math.max(0, Math.min(100, value <= 1 ? value * 100 : value)));
}

function displayItem(item) {
  if (typeof item === "string") return item;
  return item?.name || item?.skill || item?.role || item?.title || "Item";
}

function Skills({ items }) {
  if (!items?.length) {
    return <p className="muted">No skills available yet.</p>;
  }

  return (
    <div className="skill-list">
      {items.map((item, index) => (
        <span className="skill-tag" key={`${displayItem(item)}-${index}`}>
          {displayItem(item)}
        </span>
      ))}
    </div>
  );
}

const learningResources = {
  python: {
    category: "Programming",
    hours: 8,
    url: "https://docs.python.org/3/tutorial/",
    task: "Build a program using functions, lists, and dictionaries.",
  },
  react: {
    category: "Frontend Development",
    hours: 10,
    url: "https://react.dev/learn",
    task: "Build a component that displays and filters a list.",
  },
  javascript: {
    category: "Web Development",
    hours: 8,
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    task: "Build a form with validation.",
  },
  sql: {
    category: "Databases",
    hours: 6,
    url: "https://www.w3schools.com/sql/",
    task: "Practice SELECT, JOIN, and GROUP BY queries.",
  },
  docker: {
    category: "DevOps",
    hours: 6,
    url: "https://docs.docker.com/get-started/",
    task: "Containerize a simple web application.",
  },
  machine_learning: {
    category: "Artificial Intelligence",
    hours: 12,
    url: "https://scikit-learn.org/stable/tutorial/index.html",
    task: "Train and evaluate a classification model.",
  },
  tensorflow: {
    category: "Deep Learning",
    hours: 10,
    url: "https://www.tensorflow.org/tutorials",
    task: "Train a basic neural network.",
  },
  java: {
    category: "Programming",
    hours: 8,
    url: "https://dev.java/learn/",
    task: "Build a small object-oriented application.",
  },
  git: {
    category: "Developer Tools",
    hours: 3,
    url: "https://git-scm.com/doc",
    task: "Practice commits, branches, and merges.",
  },
  html: {
    category: "Web Development",
    hours: 3,
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
    task: "Build a webpage using semantic HTML.",
  },
  css: {
    category: "Web Development",
    hours: 5,
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics",
    task: "Build a responsive layout using Flexbox or Grid.",
  },
  fastapi: {
    category: "Backend Development",
    hours: 5,
    url: "https://fastapi.tiangolo.com/tutorial/",
    task: "Create an API endpoint with request validation.",
  },
  pandas: {
    category: "Data Analysis",
    hours: 5,
    url: "https://pandas.pydata.org/docs/getting_started/",
    task: "Load a CSV file and clean missing values.",
  },
  numpy: {
    category: "Data Science",
    hours: 4,
    url: "https://numpy.org/doc/stable/user/quickstart.html",
    task: "Practice array operations.",
  },
  aws: {
    category: "Cloud Computing",
    hours: 8,
    url: "https://skillbuilder.aws/",
    task: "Complete a cloud fundamentals exercise.",
  },
  mongodb: {
    category: "Databases",
    hours: 5,
    url: "https://learn.mongodb.com/",
    task: "Practice database CRUD operations.",
  },
  opencv: {
    category: "Computer Vision",
    hours: 8,
    url: "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html",
    task: "Build an image-processing script.",
  },
  pytorch: {
    category: "Deep Learning",
    hours: 10,
    url: "https://pytorch.org/tutorials/",
    task: "Train a basic neural network.",
  },
};

function getLearningResource(skill) {
  const key = String(skill)
    .toLowerCase()
    .trim()
    .replace(/[.-]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  const aliases = {
    ml: "machine_learning",
    sklearn: "machine_learning",
    scikit_learn: "machine_learning",
    nodejs: "javascript",
  };

  return (
    learningResources[aliases[key] || key] || {
      category: "Technical Skill",
      hours: 4,
      url: `https://www.google.com/search?q=${encodeURIComponent(
        `${skill} official documentation tutorial`
      )}`,
      task: `Complete a beginner exercise using ${skill}.`,
    }
  );
}

function HeroArtwork({ jobs = false }) {
  return (
    <div className={jobs ? "jobs-hero-art" : "hero-art"} aria-hidden="true">
      {jobs ? (
        <>
          <div className="search-orbit">⌕</div>
          <span className="orbit-tag tag-one">Skills ✦</span>
          <span className="orbit-tag tag-two">Growth ↗</span>
          <span className="orbit-tag tag-three">Career</span>
        </>
      ) : (
        <>
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="floating-card">
            <div className="doc-icon">▤</div>
            <div>
              <b>RESUME</b>
              <span className="fake-line long" />
              <span className="fake-line" />
              <span className="fake-line short" />
            </div>
            <span className="verified">✓</span>
          </div>
          <div className="float-chip chip-skills">✦ Skill insights</div>
          <div className="float-chip chip-match">↗ Career match</div>
          <div className="hero-ring">
            <span>AI</span>
            <small>CAREER<br />ASSISTANT</small>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("analyzer");
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [expandedJobs, setExpandedJobs] = useState([]);
  const [role, setRole] = useState("AI/ML Engineer");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function analyzeResume(event) {
    event.preventDefault();

    if (!file) {
      setError("Please select a PDF or DOCX resume.");
      return;
    }

    const extension = file.name.toLowerCase().split(".").pop();
    if (!["pdf", "docx"].includes(extension)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The resume must be 10 MB or smaller.");
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const data = await fetchJSON(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      setAnalysis(data);
      setJobs([]);
      setExpandedJobs([]);
      setMessage("Resume analyzed successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function searchJobs(event) {
    event.preventDefault();

    if (!analysis) {
      setError("Analyze your resume before searching for jobs.");
      setPage("analyzer");
      return;
    }

    const resumeText =
      analysis.resume_text || analysis.extracted_text || analysis.text || "";

    if (!resumeText) {
      setError("Resume text was not returned by the backend.");
      return;
    }

    setSearching(true);
    setError("");
    setMessage("");
    setJobs([]);

    try {
      const params = new URLSearchParams({ role, limit: "50" });
      if (location.trim()) params.set("location", location.trim());
      if (company.trim()) params.set("company", company.trim());

      const data = await fetchJSON(
        `${API_URL}/jobs/search?${params.toString()}`
      );

      const jobList = Array.isArray(data)
        ? data
        : data.jobs || data.results || [];

      const matchedJobs = await Promise.all(
        jobList.map(async (job) => {
          const description =
            job.description || job.job_description || job.content || "";
          let matchData = {};

          if (description) {
            try {
              matchData = await fetchJSON(`${API_URL}/match-job`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  resume_text: resumeText,
                  job_description: description,
                }),
              });
            } catch {
              matchData = {};
            }
          }

          return { ...job, matchData };
        })
      );

      matchedJobs.sort(
        (a, b) => (getScore(b.matchData) ?? -1) - (getScore(a.matchData) ?? -1)
      );

      setJobs(matchedJobs);
      setExpandedJobs([]);
      setPage("jobs");

      setMessage(
        matchedJobs.length
          ? `Found ${matchedJobs.length} jobs, ranked by resume match.`
          : "No jobs found. Try another role or location, or configure more job boards."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  const skills = getArray(analysis, [
    "resume_skills",
    "skills",
    "extracted_skills",
  ]);

  const recommendedRoles = getArray(analysis, [
    "recommended_roles",
    "role_recommendations",
    "role_suggestions",
  ]);

  const suggestions = getArray(analysis, [
    "improvements",
    "improvement_suggestions",
    "suggestions",
    "recommendations",
  ]);

  const rawQuality =
    analysis?.resume_quality_score ??
    analysis?.quality_score ??
    analysis?.resume_score ??
    analysis?.quality?.resume_quality_score ??
    analysis?.quality?.quality_score;

  const numericQuality = rawQuality == null ? NaN : Number(rawQuality);
  const qualityScore = Number.isFinite(numericQuality)
    ? Math.round(
        Math.max(
          0,
          Math.min(100, numericQuality <= 1 ? numericQuality * 100 : numericQuality)
        )
      )
    : null;

  function clearNotices() {
    setError("");
    setMessage("");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => setPage("analyzer")}
          aria-label="ResumeMatch home"
        >
          <span className="brand-mark">R</span>
          <span>
            <strong>ResumeMatch</strong>
            <small>AI CAREER STUDIO</small>
          </span>
        </button>

        <nav className="nav-tabs" aria-label="Main navigation">
          <button
            className={page === "analyzer" ? "nav-tab active" : "nav-tab"}
            onClick={() => setPage("analyzer")}
            type="button"
          >
            01 <span>Resume Analyzer</span>
          </button>
          <button
            className={page === "jobs" ? "nav-tab active" : "nav-tab"}
            onClick={() => setPage("jobs")}
            type="button"
          >
            02 <span>Job Matches</span>
            {jobs.length > 0 && <i>{jobs.length}</i>}
          </button>
        </nav>

        <div className="topbar-status">
          <span className="status-dot" /> Career workspace
        </div>
      </header>

      <main className="main-wrap">
        {error && (
          <div className="alert error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
              ×
            </button>
          </div>
        )}

        {message && !error && (
          <div className="alert success" role="status">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} aria-label="Dismiss message">
              ×
            </button>
          </div>
        )}

        {page === "analyzer" && (
          <section className="page-enter">
            <div className="hero">
              <div className="hero-copy">
                <span className="eyebrow">✦ YOUR NEXT CAREER MOVE</span>
                <h1>
                  Turn your resume
                  <br />
                  into <span>opportunity.</span>
                </h1>
                <p>
                  Discover your skills, understand your strengths, and take the
                  next step toward your ideal role.
                </p>
                <div className="hero-points">
                  <span>✦ Resume insights</span>
                  <span>◈ Skill discovery</span>
                  <span>↗ Job recommendations</span>
                </div>
              </div>
              <HeroArtwork />
            </div>

            <div className="section-intro">
              <div>
                <span className="eyebrow">STEP 01 / GET STARTED</span>
                <h2>Analyze your resume</h2>
                <p>Upload once. Get a clearer picture of your career strengths.</p>
              </div>
              <span className="secure-pill">⌑ Resume analysis</span>
            </div>

            <div className="analyzer-grid">
              <section className="surface upload-panel">
                <div className="panel-topline">
                  <span className="icon-tile purple">↑</span>
                  <div>
                    <h3>Upload your resume</h3>
                    <p>PDF or DOCX format · Maximum 10 MB</p>
                  </div>
                </div>

                <form onSubmit={analyzeResume}>
                  <label
                    className={`upload-drop ${file ? "has-file" : ""}`}
                    htmlFor="resume-file"
                  >
                    <span className="upload-symbol">{file ? "✓" : "⇧"}</span>
                    <strong>{file ? file.name : "Choose your resume"}</strong>
                    <span>Select a resume from your computer</span>
                    <small>PDF or DOCX</small>
                    <input
                      id="resume-file"
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(event) => {
                        setFile(event.target.files?.[0] || null);
                        setAnalysis(null);
                        setJobs([]);
                        clearNotices();
                      }}
                    />
                  </label>

                  <button
                    className="button button-primary full-button"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Analyzing your resume…" : "Analyze my resume →"}
                  </button>
                </form>

                <div className="privacy-note">
                  ✦ Your file is sent to your configured resume-analysis backend.
                </div>
              </section>

              <section className="surface preview-panel">
                <div className="panel-topline">
                  <span className="icon-tile cyan">✧</span>
                  <div>
                    <h3>Your career snapshot</h3>
                    <p>{analysis ? "Your analysis is ready." : "Insights appear here after analysis."}</p>
                  </div>
                </div>

                {analysis ? (
                  <>
                    <div className="score-summary">
                      <div
                        className="score-ring"
                        style={{ "--score": `${qualityScore ?? 0}%` }}
                        aria-label={
                          qualityScore === null
                            ? "Resume score unavailable"
                            : `Resume score ${qualityScore}%`
                        }
                      >
                        <div>
                          <strong>{qualityScore === null ? "—" : `${qualityScore}%`}</strong>
                          <span>Resume score</span>
                        </div>
                      </div>
                      <div className="score-copy">
                        <span className="mini-status"><i /> ANALYSIS COMPLETE</span>
                        <h4>Your profile is ready.</h4>
                        <p>Explore your detected skills and suggested roles.</p>
                      </div>
                    </div>

                    <div className="mini-stats">
                      <div><strong>{skills.length}</strong><span>Skills found</span></div>
                      <div><strong>{recommendedRoles.length}</strong><span>Suggested roles</span></div>
                      <div><strong>{suggestions.length}</strong><span>Improvements</span></div>
                    </div>
                  </>
                ) : (
                  <div className="empty-snapshot">
                    <div className="empty-illustration"><span>▤</span><i>✦</i><b>↗</b></div>
                    <strong>Insights, not guesswork.</strong>
                    <p>
                      Upload your resume to unlock your skill profile, feedback,
                      and job suggestions.
                    </p>
                    <div className="skeleton-line wide" />
                    <div className="skeleton-line" />
                    <div className="skeleton-tags"><i /><i /><i /></div>
                  </div>
                )}
              </section>
            </div>

            {analysis && (
              <div className="insights-layout page-enter">
                <section className="surface insight-card">
                  <div className="card-heading">
                    <span className="icon-tile cyan">✦</span>
                    <div><h3>Skills detected</h3><p>Skills identified in your resume.</p></div>
                  </div>
                  <Skills items={skills} />
                </section>

                <section className="surface insight-card">
                  <div className="card-heading">
                    <span className="icon-tile orange">◎</span>
                    <div><h3>Suggested roles</h3><p>Potential career paths.</p></div>
                  </div>
                  {recommendedRoles.length ? (
                    <div className="role-list">
                      {recommendedRoles.slice(0, 8).map((item, index) => (
                        <div className="role-row" key={`${displayItem(item)}-${index}`}>
                          <span className="role-number">{String(index + 1).padStart(2, "0")}</span>
                          <strong>{displayItem(item)}</strong>
                          <span>↗</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="muted">No role suggestions available.</p>}
                </section>

                {suggestions.length > 0 && (
                  <section className="surface insight-card suggestions-card">
                    <div className="card-heading">
                      <span className="icon-tile purple">✧</span>
                      <div><h3>Improve your resume</h3><p>Suggestions from your analysis.</p></div>
                    </div>
                    <ul className="suggestion-list">
                      {suggestions.slice(0, 8).map((item, index) => (
                        <li key={index}>{displayItem(item)}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <div className="next-step-banner">
                  <div>
                    <span className="eyebrow">YOUR NEXT STEP</span>
                    <h3>Ready to find a role that fits?</h3>
                    <p>Compare your resume with job descriptions and uncover your skill gaps.</p>
                  </div>
                  <button className="button button-light" type="button" onClick={() => setPage("jobs")}>
                    Explore matching jobs →
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {page === "jobs" && (
          <section className="page-enter">
            <div className="jobs-hero">
              <div>
                <span className="eyebrow">✦ YOUR PERSONALIZED SEARCH</span>
                <h1>Find work that<br /><span>fits your skills.</span></h1>
                <p>Discover opportunities, compare your match score, and build a plan for missing skills.</p>
              </div>
              <HeroArtwork jobs />
            </div>

            {!analysis && (
              <div className="notice-card">
                <span className="notice-icon">!</span>
                <div>
                  <strong>Analyze your resume first</strong>
                  <p>Your resume text is needed for match scores.</p>
                </div>
                <button className="button button-primary" type="button" onClick={() => setPage("analyzer")}>
                  Go to analyzer →
                </button>
              </div>
            )}

            <section className="surface search-panel">
              <div className="panel-topline">
                <span className="icon-tile cyan">⌕</span>
                <div><h3>Build your job search</h3><p>Choose a role and narrow down opportunities.</p></div>
              </div>

              <form className="search-grid" onSubmit={searchJobs}>
                <div className="form-field">
                  <label htmlFor="role">Target role</label>
                  <select id="role" value={role} onChange={(event) => setRole(event.target.value)}>
                    <option>AI/ML Engineer</option>
                    <option>Machine Learning Engineer</option>
                    <option>Data Analyst</option>
                    <option>Data Scientist</option>
                    <option>Full Stack Developer</option>
                    <option>Backend Developer</option>
                    <option>Software Engineer</option>
                    <option>Computer Vision Engineer</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="location">Location (optional)</label>
                  <input id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Hyderabad or Remote" />
                </div>
                <div className="form-field">
                  <label htmlFor="company">Company (optional)</label>
                  <input id="company" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company name" />
                </div>
                <button className="button button-primary search-button" type="submit" disabled={searching || !analysis}>
                  {searching ? "Searching jobs…" : "Search jobs →"}
                </button>
              </form>
            </section>

            {jobs.length > 0 && (
              <>
                <div className="results-toolbar">
                  <div>
                    <span className="eyebrow">MATCHED TO YOUR PROFILE</span>
                    <h2>Recommended opportunities <span className="count-pill">{jobs.length}</span></h2>
                    <p>Ranked by the available resume-to-job match score.</p>
                  </div>
                  <span className="sort-pill">↕ Match score</span>
                </div>

                <div className="jobs-grid">
                  {jobs.map((job, index) => {
                    const match = job.matchData || {};
                    const score = getScore(match);
                    const matchingSkills = getArray(match, ["matching_skills", "matched_skills"]);
                    const missingSkills = getArray(match, ["missing_skills", "skills_to_learn"]);
                    const recommendations = Array.isArray(match.skill_recommendations) ? match.skill_recommendations : [];
                    const jobKey = job.id || job.apply_url || job.url || `${job.title}-${index}`;
                    const expanded = expandedJobs.includes(jobKey);
                    const applyUrl = job.apply_url || job.applyUrl || job.url || job.job_url || "";

                    return (
                      <article className={`job-card ${index === 0 ? "featured-job" : ""}`} key={jobKey}>
                        <div className="job-card-top">
                          <div className="company-avatar">{(job.company || "J").charAt(0).toUpperCase()}</div>
                          <div className="job-title-block">
                            <h3>{job.title || "Untitled job"}</h3>
                            <p>{job.company || "Company not specified"}</p>
                          </div>
                          {score !== null && (
                            <div className="match-circle" style={{ "--score": `${score}%` }}>
                              <strong>{score}%</strong>
                            </div>
                          )}
                        </div>

                        <div className="job-meta">
                          <span>⌖ {job.location || "Location not specified"}</span>
                          {job.employment_type && <span>◷ {job.employment_type}</span>}
                          {job.source && <span>Source: {job.source}</span>}
                        </div>

                        {matchingSkills.length > 0 && (
                          <div className="job-skills-preview">
                            {matchingSkills.slice(0, 4).map((skill, i) => (
                              <span key={`${displayItem(skill)}-${i}`}>{displayItem(skill)}</span>
                            ))}
                          </div>
                        )}

                        {score !== null && (
                          <div className="match-progress">
                            <div><span>Resume compatibility</span><strong>{score}%</strong></div>
                            <div className="progress-track"><span style={{ width: `${score}%` }} /></div>
                          </div>
                        )}

                        {expanded && (
                          <div className="job-expanded">
                            {matchingSkills.length > 0 && (
                              <div className="detail-block"><h4>Your matching skills</h4><Skills items={matchingSkills} /></div>
                            )}

                            {missingSkills.length > 0 && (
                              <div className="detail-block">
                                <h4>Skills to develop</h4>
                                <Skills items={missingSkills} />
                                <div className="roadmap-list">
                                  {(recommendations.length ? recommendations : missingSkills.map((skill) => ({
                                    skill: displayItem(skill),
                                    priority: "Medium",
                                    reason: "Build practical knowledge in this area.",
                                  }))).map((item, i) => {
                                    const skillName = item.skill || displayItem(item);
                                    const resource = getLearningResource(skillName);
                                    const priority = String(item.priority || "Medium").toLowerCase();

                                    return (
                                      <div className="roadmap-item" key={`${skillName}-${i}`}>
                                        <div className="roadmap-item-head">
                                          <strong>{skillName}</strong>
                                          <span className={`priority priority-${priority}`}>{item.priority || "Medium"} priority</span>
                                        </div>
                                        <p>{item.reason || "Build practical knowledge in this area."}</p>
                                        <div className="resource-meta">
                                          <span>{resource.category}</span><span>◷ {resource.hours} hours</span>
                                        </div>
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer">Explore learning resource ↗</a>
                                        <small>Practice: {resource.task}</small>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {!matchingSkills.length && !missingSkills.length && (
                              <p className="muted">Detailed skill comparison is not available for this listing.</p>
                            )}
                          </div>
                        )}

                        <div className="job-card-actions">
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={() => setExpandedJobs((previous) => (
                              expanded ? previous.filter((id) => id !== jobKey) : [...previous, jobKey]
                            ))}
                          >
                            {expanded ? "Hide details ↑" : "View skill analysis ↓"}
                          </button>
                          {applyUrl && (
                            <a className="button button-primary apply-link" href={applyUrl} target="_blank" rel="noopener noreferrer">
                              View job & apply ↗
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {!jobs.length && analysis && !searching && (
              <div className="empty-jobs">
                <div className="empty-illustration"><span>⌕</span><i>✦</i><b>↗</b></div>
                <h3>Your next opportunity starts here.</h3>
                <p>Search for a role to see available listings, match details, and a learning roadmap.</p>
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          <span className="footer-mark">R</span>
          <span>ResumeMatch</span>
          <i />
          <span>Built for your next career move</span>
        </footer>
      </main>
    </div>
  );
}
