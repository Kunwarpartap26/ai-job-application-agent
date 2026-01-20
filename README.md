#  AutoApply AI Agent

AutoApply AI Agent is a full-stack AI-powered system that automatically generates ATS-optimized resumes, matches candidates to job listings, and simulates job applications using intelligent agent workflows.

This project demonstrates how AI agents can automate real-world career workflows such as resume tailoring, job matching, and application tracking.

---

##  Features

###  AI Resume Generator (ATS Friendly)
- Single-column layout
- Keyword optimized per job description
- No tables or images (ATS safe)
- PDF export support

###  AI Cover Letter Generator
- Personalized per job role
- Highlights relevant skills and projects
- Professional tone

###  Job Matching Engine
- Matches candidate profile with job descriptions
- Similarity scoring
- Ranks best-fit jobs

###  Auto-Apply Simulation
- Automatically fills application forms (simulated)
- Uploads tailored resume
- Tracks application status

###  Application Tracker
- Applied
- Interview
- Rejected
- Follow-up reminders

###  Testing & Evaluation
- Automated backend tests
- Resume generation validation
- Test reports for AI output quality

---

##  AI Agent Workflow
User Profile
     ↓
Skill Extraction
     ↓
Job Description Analysis
     ↓
Keyword Optimization
     ↓
Resume Generation
     ↓
Cover Letter Generation
     ↓
ATS Scoring
     ↓
Application Submission (Simulated)
ech Stack
Frontend

React

Tailwind CSS

Axios

Backend

Python (FastAPI / Flask)

AI Agent Services

Resume Optimization Pipeline

AI

Gemini / OpenAI / Claude via Universal LLM API

Prompt-based optimization

Job keyword extraction

Database

MongoDB / SQLite (development)

📂 Project Structure
autoapply-ai-agent/
│
├── frontend/              # React UI
│   └── src/
│
├── backend/               # API + AI logic
│   ├── services/
│   ├── routes/
│   └── main.py
│
├── tests/                 # Automated tests
├── test_reports/          # AI output evaluation results
├── design_guidelines.json
└── README.md

⚙️ Setup Instructions
✅ Prerequisites

Node.js 18+

Python 3.10+

pip / virtualenv

Yarn or npm

▶️ Backend Setup
cd backend
pip install -r requirements.txt
python main.py


Backend runs at:

http://localhost:8000

▶️ Frontend Setup
cd frontend
yarn install
yarn dev


Frontend runs at:

http://localhost:5173

🔐 Environment Variables

Create .env inside backend/:

LLM_API_KEY=your_universal_llm_api_key


❗ Do NOT commit .env to GitHub.

🧪 Running Tests
cd tests
pytest


Test results are saved in:

test_reports/

⚠️ Disclaimer

This project simulates job applications for educational and research purposes only.

Automated applications on platforms like LinkedIn or Indeed may violate their terms of service.
For real-world usage, official APIs or user-authorized browser automation should be used.

🌟 Future Enhancements

Chrome extension for real auto-apply

Semantic job matching using embeddings

Multi-agent architecture (LangGraph / CrewAI)

Interview preparation assistant

Resume version tracking

Recruiter email follow-ups
Why This Project Matters

This project demonstrates:

AI agent workflows

NLP-based optimization

Full-stack automation

Real-world system design

Suitable for:

Internship portfolios

Hackathons

Startup prototypes

AI system design practi
