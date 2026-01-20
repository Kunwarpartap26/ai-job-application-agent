from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from emergentintegrations.llm.chat import LlmChat, UserMessage
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_LEFT
import io
from fastapi.responses import StreamingResponse
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 720


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    education: List[dict] = []
    skills: List[str] = []
    projects: List[dict] = []
    experience: List[dict] = []
    preferred_roles: List[str] = []
    summary: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ResumeGenerate(BaseModel):
    job_description: str
    job_title: str

class Resume(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    job_title: str
    job_description: str
    content: str
    keywords: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    location: str
    description: str
    requirements: List[str]
    salary_range: Optional[str] = None
    job_type: str
    platform: str
    posted_date: datetime
    compatibility_score: Optional[int] = None

class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    job_id: str
    job_title: str
    company: str
    status: str
    resume_id: str
    cover_letter: str
    applied_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ApplicationUpdate(BaseModel):
    status: str

class JobApply(BaseModel):
    job_id: str


def create_access_token(user_id: str, email: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')


@api_router.get("/")
async def root():
    return {"message": "AutoApply AI API is running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

@api_router.post('/auth/register')
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing_user:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    user = User(email=user_data.email, name=user_data.name)
    user_dict = user.model_dump()
    user_dict['password'] = hashed_password.decode('utf-8')
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    profile = UserProfile(user_id=user.id, name=user.name, email=user.email)
    profile_dict = profile.model_dump()
    profile_dict['updated_at'] = profile_dict['updated_at'].isoformat()
    await db.profiles.insert_one(profile_dict)
    
    token = create_access_token(user.id, user.email)
    return {'token': token, 'user': {'id': user.id, 'email': user.email, 'name': user.name}}

@api_router.post('/auth/login')
async def login(credentials: UserLogin):
    user = await db.users.find_one({'email': credentials.email}, {'_id': 0})
    if not user or not bcrypt.checkpw(credentials.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    token = create_access_token(user['id'], user['email'])
    return {'token': token, 'user': {'id': user['id'], 'email': user['email'], 'name': user['name']}}

@api_router.get('/profile')
async def get_profile(user: dict = Depends(verify_token)):
    profile = await db.profiles.find_one({'user_id': user['user_id']}, {'_id': 0})
    if not profile:
        raise HTTPException(status_code=404, detail='Profile not found')
    return profile

@api_router.put('/profile')
async def update_profile(profile_data: UserProfile, user: dict = Depends(verify_token)):
    profile_data.user_id = user['user_id']
    profile_data.updated_at = datetime.now(timezone.utc)
    profile_dict = profile_data.model_dump()
    profile_dict['updated_at'] = profile_dict['updated_at'].isoformat()
    
    await db.profiles.update_one(
        {'user_id': user['user_id']},
        {'$set': profile_dict},
        upsert=True
    )
    return {'message': 'Profile updated successfully', 'profile': profile_dict}

@api_router.post('/resume/generate')
async def generate_resume(data: ResumeGenerate, user: dict = Depends(verify_token)):
    profile = await db.profiles.find_one({'user_id': user['user_id']}, {'_id': 0})
    if not profile:
        raise HTTPException(status_code=404, detail='Profile not found. Please complete your profile first.')
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    chat = LlmChat(
        api_key=api_key,
        session_id=f"resume_{user['user_id']}_{datetime.now().timestamp()}",
        system_message="You are an expert ATS-friendly resume writer. Create professional, keyword-optimized resumes."
    ).with_model("gemini", "gemini-3-flash-preview")
    
    profile_summary = f"""
Name: {profile.get('name', '')}
Email: {profile.get('email', '')}
Phone: {profile.get('phone', 'N/A')}
Location: {profile.get('location', 'N/A')}
Summary: {profile.get('summary', 'N/A')}

Skills: {", ".join(profile.get('skills', []))}

Education:
{chr(10).join([f"- {edu.get('degree', '')} in {edu.get('field', '')} from {edu.get('institution', '')} ({edu.get('year', '')})" for edu in profile.get('education', [])])}

Experience:
{chr(10).join([f"- {exp.get('title', '')} at {exp.get('company', '')} ({exp.get('duration', '')}): {exp.get('description', '')}" for exp in profile.get('experience', [])])}

Projects:
{chr(10).join([f"- {proj.get('name', '')}: {proj.get('description', '')}" for proj in profile.get('projects', [])])}
"""
    
    prompt = f"""Create an ATS-friendly resume for the following job:

Job Title: {data.job_title}
Job Description: {data.job_description}

Candidate Profile:
{profile_summary}

IMPORTANT REQUIREMENTS:
1. Use a single-column layout (no tables)
2. Extract and incorporate relevant keywords from the job description
3. Optimize bullet points to match job requirements
4. Keep formatting simple and ATS-scannable
5. Highlight relevant skills and experience
6. Return ONLY the resume content in plain text format, well-structured with clear sections
7. Include these sections: Contact Info, Professional Summary, Skills, Experience, Education, Projects
8. Do not include any images or complex formatting

Generate the ATS-optimized resume now:"""
    
    message = UserMessage(text=prompt)
    response = await chat.send_message(message)
    
    keywords_prompt = f"""Extract the top 10 most important keywords from this job description that should be in the resume:

{data.job_description}

Return ONLY a comma-separated list of keywords, nothing else."""
    
    keywords_message = UserMessage(text=keywords_prompt)
    keywords_response = await chat.send_message(keywords_message)
    keywords = [k.strip() for k in keywords_response.split(',')]
    
    resume = Resume(
        user_id=user['user_id'],
        job_title=data.job_title,
        job_description=data.job_description,
        content=response,
        keywords=keywords
    )
    
    resume_dict = resume.model_dump()
    resume_dict['created_at'] = resume_dict['created_at'].isoformat()
    await db.resumes.insert_one(resume_dict)
    
    return {'resume': resume_dict}

@api_router.post('/resume/export-pdf')
async def export_pdf(resume_id: str, user: dict = Depends(verify_token)):
    resume = await db.resumes.find_one({'id': resume_id, 'user_id': user['user_id']}, {'_id': 0})
    if not resume:
        raise HTTPException(status_code=404, detail='Resume not found')
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor='black',
        spaceAfter=6,
        alignment=TA_LEFT
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor='black',
        spaceAfter=6,
        alignment=TA_LEFT
    )
    
    story = []
    content_lines = resume['content'].split('\n')
    
    for line in content_lines:
        line = line.strip()
        if not line:
            story.append(Spacer(1, 0.1*inch))
            continue
        
        if line.isupper() or (line.endswith(':') and len(line) < 50):
            story.append(Paragraph(line, title_style))
        else:
            story.append(Paragraph(line, body_style))
    
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type='application/pdf',
        headers={'Content-Disposition': f'attachment; filename="resume_{resume_id}.pdf"'}
    )

@api_router.get('/jobs/search')
async def search_jobs(user: dict = Depends(verify_token), platform: Optional[str] = None):
    profile = await db.profiles.find_one({'user_id': user['user_id']}, {'_id': 0})
    user_skills = profile.get('skills', []) if profile else []
    
    dummy_jobs = [
        {
            'id': str(uuid.uuid4()),
            'title': 'Senior Full Stack Developer',
            'company': 'TechCorp',
            'location': 'San Francisco, CA',
            'description': 'We are looking for an experienced Full Stack Developer to join our team. Must have expertise in React, Node.js, and MongoDB.',
            'requirements': ['React', 'Node.js', 'MongoDB', 'REST APIs', '5+ years experience'],
            'salary_range': '$120k - $180k',
            'job_type': 'Full-time',
            'platform': 'LinkedIn',
            'posted_date': (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'AI/ML Engineer',
            'company': 'InnovateLabs',
            'location': 'Remote',
            'description': 'Join our AI team to build cutting-edge machine learning solutions. Experience with Python, TensorFlow, and large-scale data processing required.',
            'requirements': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
            'salary_range': '$140k - $200k',
            'job_type': 'Full-time',
            'platform': 'Indeed',
            'posted_date': (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Frontend Developer',
            'company': 'DesignCo',
            'location': 'New York, NY',
            'description': 'Creative frontend developer needed for building beautiful user interfaces. Must be proficient in React, TypeScript, and modern CSS.',
            'requirements': ['React', 'TypeScript', 'CSS', 'Responsive Design', 'Figma'],
            'salary_range': '$90k - $130k',
            'job_type': 'Full-time',
            'platform': 'Wellfound',
            'posted_date': (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'DevOps Engineer',
            'company': 'CloudSystems',
            'location': 'Austin, TX',
            'description': 'DevOps engineer to manage our cloud infrastructure. Experience with AWS, Docker, and Kubernetes is essential.',
            'requirements': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
            'salary_range': '$110k - $160k',
            'job_type': 'Full-time',
            'platform': 'LinkedIn',
            'posted_date': (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Data Scientist',
            'company': 'DataDrive',
            'location': 'Boston, MA',
            'description': 'Data scientist to analyze large datasets and build predictive models. Strong statistical background required.',
            'requirements': ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization'],
            'salary_range': '$100k - $150k',
            'job_type': 'Full-time',
            'platform': 'Indeed',
            'posted_date': (datetime.now(timezone.utc) - timedelta(days=4)).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Backend Developer',
            'company': 'ServerTech',
            'location': 'Seattle, WA',
            'description': 'Backend developer for building scalable APIs. Experience with Python, FastAPI, and PostgreSQL required.',
            'requirements': ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs', 'Microservices'],
            'salary_range': '$105k - $145k',
            'job_type': 'Full-time',
            'platform': 'Wellfound',
            'posted_date': (datetime.now(timezone.utc) - timedelta(days=6)).isoformat()
        }
    ]
    
    for job in dummy_jobs:
        if user_skills:
            matching_skills = sum(1 for req in job['requirements'] if any(skill.lower() in req.lower() for skill in user_skills))
            job['compatibility_score'] = min(95, int((matching_skills / len(job['requirements'])) * 100) + random.randint(10, 20))
        else:
            job['compatibility_score'] = random.randint(60, 85)
    
    if platform:
        dummy_jobs = [job for job in dummy_jobs if job['platform'].lower() == platform.lower()]
    
    dummy_jobs.sort(key=lambda x: x['compatibility_score'], reverse=True)
    
    return {'jobs': dummy_jobs}

@api_router.post('/jobs/apply')
async def apply_to_job(data: JobApply, user: dict = Depends(verify_token)):
    jobs_response = await search_jobs(user)
    job = next((j for j in jobs_response['jobs'] if j['id'] == data.job_id), None)
    
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    
    existing_application = await db.applications.find_one(
        {'user_id': user['user_id'], 'job_id': data.job_id},
        {'_id': 0}
    )
    if existing_application:
        raise HTTPException(status_code=400, detail='Already applied to this job')
    
    resume_data = ResumeGenerate(
        job_description=job['description'],
        job_title=job['title']
    )
    resume_response = await generate_resume(resume_data, user)
    resume = resume_response['resume']
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    chat = LlmChat(
        api_key=api_key,
        session_id=f"cover_letter_{user['user_id']}_{datetime.now().timestamp()}",
        system_message="You are an expert cover letter writer."
    ).with_model("gemini", "gemini-3-flash-preview")
    
    profile = await db.profiles.find_one({'user_id': user['user_id']}, {'_id': 0})
    cover_letter_prompt = f"""Write a professional cover letter for this job application:

Job Title: {job['title']}
Company: {job['company']}
Job Description: {job['description']}

Candidate Name: {profile.get('name', '')}
Candidate Skills: {", ".join(profile.get('skills', []))}

Write a concise, compelling cover letter (3-4 paragraphs) that highlights relevant experience and enthusiasm for the role."""
    
    cover_letter_message = UserMessage(text=cover_letter_prompt)
    cover_letter = await chat.send_message(cover_letter_message)
    
    application = Application(
        user_id=user['user_id'],
        job_id=data.job_id,
        job_title=job['title'],
        company=job['company'],
        status='Applied',
        resume_id=resume['id'],
        cover_letter=cover_letter
    )
    
    app_dict = application.model_dump()
    app_dict['applied_at'] = app_dict['applied_at'].isoformat()
    app_dict['updated_at'] = app_dict['updated_at'].isoformat()
    await db.applications.insert_one(app_dict)
    
    return {'message': 'Application submitted successfully', 'application': app_dict}

@api_router.get('/applications')
async def get_applications(user: dict = Depends(verify_token)):
    applications = await db.applications.find({'user_id': user['user_id']}, {'_id': 0}).to_list(1000)
    applications.sort(key=lambda x: x['applied_at'], reverse=True)
    return {'applications': applications}

@api_router.put('/applications/{application_id}')
async def update_application(application_id: str, data: ApplicationUpdate, user: dict = Depends(verify_token)):
    result = await db.applications.update_one(
        {'id': application_id, 'user_id': user['user_id']},
        {'$set': {'status': data.status, 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail='Application not found')
    
    return {'message': 'Application status updated successfully'}

@api_router.get('/resumes')
async def get_resumes(user: dict = Depends(verify_token)):
    resumes = await db.resumes.find({'user_id': user['user_id']}, {'_id': 0}).to_list(1000)
    resumes.sort(key=lambda x: x['created_at'], reverse=True)
    return {'resumes': resumes}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()