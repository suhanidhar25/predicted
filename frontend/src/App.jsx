import { useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  BookOpen,
  CalendarCheck,
  Check,
  GraduationCap,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import "./App.css";

const initialInputs = {
  hours: 5,
  attendance: 80,
  previous: 65,
};

const inputFields = [
  {
    id: "hours",
    label: "Daily study hours",
    hint: "A typical day of focused study",
    min: 0,
    max: 12,
    unit: "hrs",
    Icon: BookOpen,
  },
  {
    id: "attendance",
    label: "Attendance",
    hint: "Your attended classes this term",
    min: 0,
    max: 100,
    unit: "%",
    Icon: CalendarCheck,
  },
  {
    id: "previous",
    label: "Previous exam marks",
    hint: "Your most recent exam result",
    min: 0,
    max: 100,
    unit: "/100",
    Icon: TrendingUp,
  },
];

export default function App() {
  const [inputs, setInputs] = useState(initialInputs);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateInput(event) {
    const { name, value } = event.target;
    setInputs((current) => ({ ...current, [name]: Number(value) }));
  }

  async function predict() {
    setLoading(true);
    setError("");
    setResult(null);

    const predictionInputs = {
      hours: Number(inputs.hours),
      attendance: Number(inputs.attendance),
      previous: Number(inputs.previous),
    };

    try {
      const response = await fetch(
  `${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/predict`,
  {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictionInputs),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Prediction failed. Please try again.");
      }

      if (
        typeof data.predicted_score !== "number" ||
        typeof data.performance !== "string"
      ) {
        throw new Error("The prediction service returned an unexpected response.");
      }

      setResult({ ...data, inputs: predictionInputs });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(
        message.toLowerCase().includes("fetch")
          ? "Cannot connect to the Python server. Please start the backend and try again."
          : message,
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setInputs(initialInputs);
    setResult(null);
    setError("");
  }

  const score = result?.predicted_score;
  const scoreOffset = score === undefined ? 283 : 283 - (283 * score) / 100;

  return (
    <main className="page" id="overview">
      <header className="site-header">
        <a className="brand" href="#overview" aria-label="PredictEd home">
          <span className="brand-mark">
            <GraduationCap size={22} strokeWidth={2.2} />
          </span>
          <span>Predict<span className="brand-accent">Ed</span></span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#overview">Overview</a>
          <a className="nav-link" href="#predictions">Predictions</a>
          <a className="nav-link" href="#about-model">About model</a>
        </nav>

        <span className="powered-badge">
          <span className="powered-dot" />
          ML Powered
        </span>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Student performance analytics</p>
          <h1 id="hero-title">Understand your potential.<br /><span>Shape your future.</span></h1>
          <p className="hero-description">
            Explore an estimated academic score based on your study habits,
            attendance, and previous exam marks.
          </p>
        </div>
        <div className="hero-note">
          <span className="hero-note-icon"><BrainCircuit size={18} /></span>
          <span><strong>Thoughtful insights</strong><small>Generated with machine learning</small></span>
          <Sparkles className="hero-sparkle" size={16} />
        </div>
      </section>

      <section className="dashboard" id="predictions" aria-label="Student prediction dashboard">
        <article className="panel input-panel">
          <div className="panel-heading">
            <div className="heading-icon"><GraduationCap size={20} /></div>
            <div>
              <p className="section-kicker">Your profile</p>
              <h2>Student input</h2>
            </div>
            <span className="step-label">01 <span>/ 02</span></span>
          </div>
          <p className="panel-intro">Adjust your details to explore an estimated outcome.</p>

          <div className="fields">
            {inputFields.map(({ id, label, hint, min, max, unit, Icon }) => {
              const value = inputs[id];
              const progress = ((value - min) / (max - min)) * 100;
              return (
                <div className="field" key={id}>
                  <div className="field-heading">
                    <div className="field-name">
                      <span className="field-icon"><Icon size={17} /></span>
                      <div>
                        <label htmlFor={id}>{label}</label>
                        <span className="field-hint">{hint}</span>
                      </div>
                    </div>
                    <output className="field-value" htmlFor={id}>
                      {value}<span>{unit}</span>
                    </output>
                  </div>
                  <input
                    className="range-input"
                    id={id}
                    name={id}
                    type="range"
                    min={min}
                    max={max}
                    step="1"
                    value={value}
                    onChange={updateInput}
                    style={{ "--range-progress": `${progress}%` }}
                    aria-label={label}
                  />
                  <div className="range-labels"><span>{min}{id === "hours" ? " hrs" : ""}</span><span>{max}{id === "hours" ? " hrs" : id === "attendance" ? "%" : ""}</span></div>
                </div>
              );
            })}
          </div>

          <div className="form-actions">
            <button className="predict-btn" onClick={predict} disabled={loading}>
              {loading ? (
                <><LoaderCircle className="spin" size={18} /> Generating estimate…</>
              ) : (
                <>Generate prediction <ArrowRight size={18} /></>
              )}
            </button>
            <button className="reset-btn" onClick={reset} disabled={loading}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
          <p className="privacy-note"><Check size={14} /> Your inputs are used only for this estimate.</p>
        </article>

        <article className="panel result-panel" aria-live="polite">
          <div className="result-topline">
            <div>
              <p className="section-kicker">Your estimate</p>
              <h2>Prediction results</h2>
            </div>
            <span className="model-badge"><BrainCircuit size={14} /> Linear Regression</span>
          </div>

          {result ? (
            <div className="result-content" key={`${result.predicted_score}-${result.inputs.hours}-${result.inputs.attendance}-${result.inputs.previous}`}>
              <div className="score-visual">
                <svg className="score-ring" viewBox="0 0 104 104" role="img" aria-label={`Estimated score ${result.predicted_score} out of 100`}>
                  <circle className="ring-track" cx="52" cy="52" r="45" />
                  <circle
                    className="ring-progress"
                    cx="52"
                    cy="52"
                    r="45"
                    style={{ "--score-offset": scoreOffset }}
                  />
                </svg>
                <div className="score-number">
                  <strong>{result.predicted_score}</strong>
                  <span>out of 100</span>
                </div>
              </div>
              <span className="result-category">{result.performance}</span>
              <p className="result-description">
                This is an estimate from the model’s sample training data, not a guarantee or a complete measure of your academic ability.
              </p>
              <div className="used-inputs">
                <p className="used-inputs-title">Inputs used for this estimate</p>
                <div className="input-summary">
                  <span><BookOpen size={15} /><strong>{result.inputs.hours}</strong> hrs/day</span>
                  <span><CalendarCheck size={15} /><strong>{result.inputs.attendance}%</strong> attendance</span>
                  <span><TrendingUp size={15} /><strong>{result.inputs.previous}</strong> previous marks</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-result">
              <div className="empty-visual">
                <span className="empty-orbit orbit-one" />
                <span className="empty-orbit orbit-two" />
                <span className="empty-icon"><BrainCircuit size={28} /></span>
                <span className="empty-sparkle"><Sparkles size={15} /></span>
              </div>
              <h3>{loading ? "Working on your estimate" : "Your next step starts here"}</h3>
              <p>{loading ? "The model is reviewing the inputs you provided." : "Enter your details, then generate a prediction to see your estimated score."}</p>
              <span className="empty-footnote"><span className={loading ? "powered-dot pulse-dot" : "powered-dot"} /> {loading ? "Connecting to model" : "Ready when you are"}</span>
            </div>
          )}

          <div className="result-foot">
            <span className="result-foot-icon"><Sparkles size={14} /></span>
            <span>Predictions are for learning and demonstration only.</span>
          </div>
        </article>
      </section>

      <section className="insights-section" aria-labelledby="insights-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">A few things to consider</p>
            <h2 id="insights-title">Small habits, steady progress</h2>
          </div>
          <p>General study perspectives to support your own learning journey.</p>
        </div>
        <div className="insight-grid">
          <article className="insight-card">
            <span className="insight-icon sage"><BookOpen size={18} /></span>
            <h3>Study consistency</h3>
            <p>A regular, manageable study rhythm can make it easier to revisit and build on what you learn.</p>
          </article>
          <article className="insight-card">
            <span className="insight-icon gold"><CalendarCheck size={18} /></span>
            <h3>Showing up</h3>
            <p>Attending class gives you more chances to engage with lessons, ask questions, and stay connected.</p>
          </article>
          <article className="insight-card">
            <span className="insight-icon pale"><TrendingUp size={18} /></span>
            <h3>Learning from progress</h3>
            <p>Past results can help you reflect on what is working and where you may want extra support.</p>
          </article>
        </div>
      </section>

      <section className="model-section" id="about-model" aria-labelledby="model-title">
        <div className="model-copy">
          <p className="section-kicker">Behind the estimate</p>
          <h2 id="model-title">A simple model.<br /><span>A useful starting point.</span></h2>
          <p className="model-description">
            Linear Regression looks at how input values relate to an outcome in its training examples, then uses those patterns to estimate a score for new inputs.
          </p>
          <div className="model-disclosure">
            <span className="disclosure-icon"><BrainCircuit size={17} /></span>
            <p><strong>Made for demonstration</strong><br />This version uses a small illustrative dataset. It is not designed for reliable real-world academic assessment, and its estimates should not guide important decisions.</p>
          </div>
        </div>
        <div className="model-flow-card">
          <p className="flow-caption">HOW AN ESTIMATE IS MADE</p>
          <div className="model-flow">
            <div className="flow-step">
              <span className="flow-icon input-flow"><GraduationCap size={19} /></span>
              <strong>Student inputs</strong>
              <small>3 profile details</small>
            </div>
            <ArrowRight className="flow-arrow" size={18} />
            <div className="flow-step">
              <span className="flow-icon model-flow-icon"><BrainCircuit size={19} /></span>
              <strong>ML model</strong>
              <small>Linear Regression</small>
            </div>
            <ArrowRight className="flow-arrow" size={18} />
            <div className="flow-step">
              <span className="flow-icon score-flow"><TrendingUp size={19} /></span>
              <strong>Estimated score</strong>
              <small>Out of 100</small>
            </div>
          </div>
          <div className="flow-features">
            <span>Study hours</span><span>Attendance</span><span>Previous marks</span>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#overview">
          <span className="brand-mark"><GraduationCap size={19} strokeWidth={2.2} /></span>
          <span>Predict<span className="brand-accent">Ed</span></span>
        </a>
        <p>Make room for what you can become.</p>
        <span className="built-with">Built with React, Flask &amp; scikit-learn</span>
      </footer>
    </main>
  );
}
