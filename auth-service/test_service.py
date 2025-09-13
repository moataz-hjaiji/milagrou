#!/usr/bin/env python3
"""
Test script for the Authentication Microservice
Run this script to test all endpoints
"""

import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

class AuthTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.admin_token = None
        
    def print_response(self, response: requests.Response, title: str):
        """Print formatted response"""
        print(f"\n{'='*50}")
        print(f"🧪 {title}")
        print(f"{'='*50}")
        print(f"Status: {response.status_code}")
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, default=str)}")
        except:
            print(f"Response: {response.text}")
        print(f"{'='*50}")
    
    def test_health(self):
        """Test health endpoint"""
        response = requests.get(f"{self.base_url}/health")
        self.print_response(response, "Health Check")
        return response.status_code == 200
    
    def test_signup(self):
        """Test user signup"""
        user_data = {
            "email": "test@example.com",
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        response = requests.post(f"{self.base_url}/auth/signup", json=user_data)
        self.print_response(response, "User Signup")
        
        if response.status_code == 201:
            data = response.json()
            self.token = data.get("access_token")
            return True
        return False
    
    def test_login(self):
        """Test user login"""
        login_data = {
            "email": "test@example.com",
            "password": "TestPass123!"
        }
        
        response = requests.post(f"{self.base_url}/auth/login", json=login_data)
        self.print_response(response, "User Login")
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
            return True
        return False
    
    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "email": "admin@example.com",
            "password": "AdminPass123!"
        }
        
        response = requests.post(f"{self.base_url}/auth/login", json=login_data)
        self.print_response(response, "Admin Login")
        
        if response.status_code == 200:
            data = response.json()
            self.admin_token = data.get("access_token")
            return True
        return False
    
    def test_verify_token(self):
        """Test token verification"""
        if not self.token:
            print("❌ No token available for verification")
            return False
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(f"{self.base_url}/auth/verify", headers=headers)
        self.print_response(response, "Token Verification")
        
        return response.status_code == 200
    
    def test_get_profile(self):
        """Test getting user profile"""
        if not self.token:
            print("❌ No token available for profile request")
            return False
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.base_url}/auth/me", headers=headers)
        self.print_response(response, "Get User Profile")
        
        return response.status_code == 200
    
    def test_get_users_admin(self):
        """Test getting all users (admin only)"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{self.base_url}/auth/users", headers=headers)
        self.print_response(response, "Get All Users (Admin)")
        
        return response.status_code == 200
    
    def test_invalid_token(self):
        """Test with invalid token"""
        headers = {"Authorization": "Bearer invalid-token"}
        response = requests.post(f"{self.base_url}/auth/verify", headers=headers)
        self.print_response(response, "Invalid Token Test")
        
        # Should return 200 but with valid: false
        return response.status_code == 200
    
    def test_protected_route_without_token(self):
        """Test protected route without token"""
        response = requests.get(f"{self.base_url}/auth/me")
        self.print_response(response, "Protected Route Without Token")
        
        # Should return 401
        return response.status_code == 401
    
    def test_signup_duplicate_email(self):
        """Test signup with duplicate email"""
        user_data = {
            "email": "test@example.com",
            "password": "AnotherPass123!",
            "name": "Another User"
        }
        
        response = requests.post(f"{self.base_url}/auth/signup", json=user_data)
        self.print_response(response, "Duplicate Email Signup")
        
        # Should return 400
        return response.status_code == 400
    
    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        login_data = {
            "email": "test@example.com",
            "password": "wrongpassword"
        }
        
        response = requests.post(f"{self.base_url}/auth/login", json=login_data)
        self.print_response(response, "Invalid Credentials Login")
        
        # Should return 401
        return response.status_code == 401
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Authentication Microservice Tests")
        print(f"🌐 Base URL: {self.base_url}")
        
        tests = [
            ("Health Check", self.test_health),
            ("User Signup", self.test_signup),
            ("User Login", self.test_login),
            ("Admin Login", self.test_admin_login),
            ("Token Verification", self.test_verify_token),
            ("Get User Profile", self.test_get_profile),
            ("Get All Users (Admin)", self.test_get_users_admin),
            ("Invalid Token Test", self.test_invalid_token),
            ("Protected Route Without Token", self.test_protected_route_without_token),
            ("Duplicate Email Signup", self.test_signup_duplicate_email),
            ("Invalid Credentials", self.test_invalid_credentials)
        ]
        
        results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                results.append((test_name, result))
                print(f"{'✅' if result else '❌'} {test_name}: {'PASSED' if result else 'FAILED'}")
                time.sleep(0.5)  # Small delay between tests
            except Exception as e:
                results.append((test_name, False))
                print(f"❌ {test_name}: ERROR - {e}")
        
        # Summary
        print(f"\n{'='*60}")
        print("📊 TEST RESULTS SUMMARY")
        print(f"{'='*60}")
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} | {test_name}")
        
        print(f"\n🎯 Total: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Authentication service is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the output above for details.")
        
        return passed == total

if __name__ == "__main__":
    tester = AuthTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)
