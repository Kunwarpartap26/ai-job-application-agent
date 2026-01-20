import requests
import sys
import json
from datetime import datetime

class AutoApplyAPITester:
    def __init__(self, base_url="https://apply-automation-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def run_api_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        # Default headers
        default_headers = {'Content-Type': 'application/json'}
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            default_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success and response.content:
                try:
                    response_data = response.json()
                    details += f", Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}"
                except:
                    details += ", Response: Non-JSON"
            elif not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Raw response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        self.run_api_test("API Root", "GET", "", 200)
        self.run_api_test("Health Check", "GET", "health", 200)

    def test_authentication(self):
        """Test user registration and login"""
        print("\n🔍 Testing Authentication...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test_user_{timestamp}@example.com"
        test_password = "TestPass123!"
        test_name = f"Test User {timestamp}"

        # Test registration
        register_data = {
            "email": test_email,
            "password": test_password,
            "name": test_name
        }
        
        success, response = self.run_api_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=register_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.log_test("Token Extraction", True, f"User ID: {self.user_id}")
        else:
            self.log_test("Token Extraction", False, "No token in registration response")
            return False

        # Test login with same credentials
        login_data = {
            "email": test_email,
            "password": test_password
        }
        
        success, response = self.run_api_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        return success

    def test_profile_management(self):
        """Test profile creation and updates"""
        print("\n🔍 Testing Profile Management...")
        
        if not self.token:
            self.log_test("Profile Tests", False, "No authentication token available")
            return False

        # Test get profile
        success, profile = self.run_api_test(
            "Get Profile",
            "GET",
            "profile",
            200
        )

        if not success:
            return False

        # Test profile update
        updated_profile = {
            "user_id": self.user_id,
            "name": "Updated Test User",
            "email": profile.get('email', 'test@example.com'),
            "phone": "+1234567890",
            "location": "San Francisco, CA",
            "summary": "Experienced software developer with expertise in full-stack development",
            "skills": ["Python", "JavaScript", "React", "FastAPI", "MongoDB"],
            "education": [
                {
                    "degree": "Bachelor of Science",
                    "field": "Computer Science",
                    "institution": "Test University",
                    "year": "2020"
                }
            ],
            "experience": [
                {
                    "title": "Software Developer",
                    "company": "Tech Corp",
                    "duration": "2020-2023",
                    "description": "Developed web applications using modern technologies"
                }
            ],
            "projects": [
                {
                    "name": "AutoApply AI",
                    "description": "AI-powered job application system",
                    "technologies": "React, FastAPI, MongoDB"
                }
            ],
            "preferred_roles": ["Full Stack Developer", "Software Engineer"]
        }

        success, response = self.run_api_test(
            "Update Profile",
            "PUT",
            "profile",
            200,
            data=updated_profile
        )

        return success

    def test_job_search(self):
        """Test job search functionality"""
        print("\n🔍 Testing Job Search...")
        
        if not self.token:
            self.log_test("Job Search Tests", False, "No authentication token available")
            return False

        # Test job search without filters
        success, response = self.run_api_test(
            "Job Search - All Jobs",
            "GET",
            "jobs/search",
            200
        )

        if success and 'jobs' in response:
            jobs = response['jobs']
            self.log_test("Job Data Validation", len(jobs) > 0, f"Found {len(jobs)} jobs")
            
            if jobs:
                job = jobs[0]
                required_fields = ['id', 'title', 'company', 'description', 'compatibility_score']
                missing_fields = [field for field in required_fields if field not in job]
                self.log_test("Job Fields Validation", len(missing_fields) == 0, 
                            f"Missing fields: {missing_fields}" if missing_fields else "All required fields present")
                
                # Store first job for apply test
                self.test_job_id = job['id']
                return True
        
        return False

    def test_resume_generation(self):
        """Test AI resume generation"""
        print("\n🔍 Testing Resume Generation...")
        
        if not self.token:
            self.log_test("Resume Generation Tests", False, "No authentication token available")
            return False

        resume_data = {
            "job_description": "We are looking for a skilled Full Stack Developer with experience in React, Python, and MongoDB to join our team.",
            "job_title": "Full Stack Developer"
        }

        success, response = self.run_api_test(
            "Generate Resume",
            "POST",
            "resume/generate",
            200,
            data=resume_data
        )

        if success and 'resume' in response:
            resume = response['resume']
            self.test_resume_id = resume['id']
            
            # Validate resume content
            has_content = len(resume.get('content', '')) > 100
            has_keywords = len(resume.get('keywords', [])) > 0
            
            self.log_test("Resume Content Validation", has_content, 
                        f"Content length: {len(resume.get('content', ''))}")
            self.log_test("Resume Keywords Validation", has_keywords, 
                        f"Keywords: {resume.get('keywords', [])}")
            
            return True
        
        return False

    def test_job_application(self):
        """Test auto-apply functionality"""
        print("\n🔍 Testing Job Application...")
        
        if not self.token or not hasattr(self, 'test_job_id'):
            self.log_test("Job Application Tests", False, "No authentication token or job ID available")
            return False

        apply_data = {
            "job_id": self.test_job_id
        }

        success, response = self.run_api_test(
            "Apply to Job",
            "POST",
            "jobs/apply",
            200,
            data=apply_data
        )

        if success and 'application' in response:
            application = response['application']
            self.test_application_id = application['id']
            
            # Validate application data
            has_cover_letter = len(application.get('cover_letter', '')) > 50
            has_resume_id = bool(application.get('resume_id'))
            
            self.log_test("Cover Letter Generation", has_cover_letter, 
                        f"Cover letter length: {len(application.get('cover_letter', ''))}")
            self.log_test("Resume Association", has_resume_id, 
                        f"Resume ID: {application.get('resume_id')}")
            
            return True
        
        return False

    def test_application_tracking(self):
        """Test application tracking functionality"""
        print("\n🔍 Testing Application Tracking...")
        
        if not self.token:
            self.log_test("Application Tracking Tests", False, "No authentication token available")
            return False

        # Test get applications
        success, response = self.run_api_test(
            "Get Applications",
            "GET",
            "applications",
            200
        )

        if success and 'applications' in response:
            applications = response['applications']
            self.log_test("Applications Data", len(applications) > 0, f"Found {len(applications)} applications")
            
            # Test status update if we have an application
            if hasattr(self, 'test_application_id'):
                update_data = {"status": "Interview"}
                success, response = self.run_api_test(
                    "Update Application Status",
                    "PUT",
                    f"applications/{self.test_application_id}",
                    200,
                    data=update_data
                )
                return success
            
            return True
        
        return False

    def test_resume_management(self):
        """Test resume management"""
        print("\n🔍 Testing Resume Management...")
        
        if not self.token:
            self.log_test("Resume Management Tests", False, "No authentication token available")
            return False

        # Test get resumes
        success, response = self.run_api_test(
            "Get Resumes",
            "GET",
            "resumes",
            200
        )

        if success and 'resumes' in response:
            resumes = response['resumes']
            self.log_test("Resumes Data", len(resumes) > 0, f"Found {len(resumes)} resumes")
            return True
        
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting AutoApply AI API Tests")
        print("=" * 50)
        
        # Test sequence
        self.test_health_endpoints()
        
        if self.test_authentication():
            self.test_profile_management()
            self.test_job_search()
            self.test_resume_generation()
            self.test_job_application()
            self.test_application_tracking()
            self.test_resume_management()
        else:
            print("❌ Authentication failed - skipping remaining tests")

        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed, self.tests_run, self.test_results

def main():
    tester = AutoApplyAPITester()
    passed, total, results = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'tests_passed': passed,
                'tests_total': total,
                'success_rate': (passed/total)*100 if total > 0 else 0
            },
            'results': results
        }, f, indent=2)
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())