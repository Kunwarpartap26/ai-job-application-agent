import requests
import json
from datetime import datetime

def test_resume_generation():
    base_url = "https://apply-automation-2.preview.emergentagent.com/api"
    
    # Register a new user
    timestamp = datetime.now().strftime('%H%M%S%f')
    register_data = {
        "email": f"test_resume_{timestamp}@example.com",
        "password": "TestPass123!",
        "name": f"Test User {timestamp}"
    }
    
    print("1. Registering user...")
    response = requests.post(f"{base_url}/auth/register", json=register_data)
    if response.status_code != 200:
        print(f"Registration failed: {response.status_code} - {response.text}")
        return False
    
    token = response.json()['token']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    print("2. Updating profile...")
    profile_data = {
        "user_id": response.json()['user']['id'],
        "name": "Test User",
        "email": register_data['email'],
        "skills": ["Python", "JavaScript"],
        "education": [{"degree": "BS", "field": "CS", "institution": "Test Uni", "year": "2020"}],
        "experience": [{"title": "Developer", "company": "Test Corp", "duration": "2020-2023", "description": "Developed apps"}]
    }
    
    profile_response = requests.put(f"{base_url}/profile", json=profile_data, headers=headers)
    if profile_response.status_code != 200:
        print(f"Profile update failed: {profile_response.status_code} - {profile_response.text}")
        return False
    
    print("3. Testing resume generation...")
    resume_data = {
        "job_description": "We need a Python developer with experience in web development.",
        "job_title": "Python Developer"
    }
    
    try:
        resume_response = requests.post(f"{base_url}/resume/generate", json=resume_data, headers=headers)
        print(f"Resume generation status: {resume_response.status_code}")
        
        if resume_response.status_code == 200:
            result = resume_response.json()
            print(" Resume generation successful!")
            print(f"Resume ID: {result['resume']['id']}")
            print(f"Content length: {len(result['resume']['content'])}")
            print(f"Keywords: {result['resume']['keywords']}")
            return True
        else:
            print(f" Resume generation failed: {resume_response.text}")
            return False
            
    except Exception as e:
        print(f"Exception during resume generation: {e}")
        return False

if __name__ == "__main__":
    success = test_resume_generation()
    exit(0 if success else 1)