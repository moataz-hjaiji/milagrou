#!/usr/bin/env python3
"""
Test script for the auth service to verify MongoDB integration
"""
import asyncio
import requests
import json
import time

AUTH_BASE_URL = "http://localhost:9000"

def test_auth_service():
    """Test the auth service endpoints"""
    print("🧪 Testing Auth Service...")
    
    # Test health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{AUTH_BASE_URL}/health")
        print(f"Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test user registration
    print("\n2. Testing user registration...")
    user_data = {
        "email": "test@example.com",
        "password": "TestPass123!",
        "name": "Test User"
    }
    
    try:
        response = requests.post(f"{AUTH_BASE_URL}/auth/signup", json=user_data)
        if response.status_code == 201:
            signup_result = response.json()
            token = signup_result.get("access_token")
            print(f"✅ Registration successful: {signup_result['user']['name']}")
            print(f"🔑 Token: {token[:50]}...")
        else:
            print(f"❌ Registration failed: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return
    
    # Test user login
    print("\n3. Testing user login...")
    login_data = {
        "email": "test@example.com",
        "password": "TestPass123!"
    }
    
    try:
        response = requests.post(f"{AUTH_BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            login_result = response.json()
            token = login_result.get("access_token")
            print(f"✅ Login successful: {login_result['user']['name']}")
            print(f"🔑 Token: {token[:50]}...")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Test token verification
    print("\n4. Testing token verification...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(f"{AUTH_BASE_URL}/auth/verify", headers=headers)
        if response.status_code == 200:
            verify_result = response.json()
            print(f"✅ Token verification: {verify_result}")
        else:
            print(f"❌ Token verification failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Token verification error: {e}")
    
    # Test getting current user profile
    print("\n5. Testing user profile...")
    try:
        response = requests.get(f"{AUTH_BASE_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            profile = response.json()
            print(f"✅ User profile: {profile}")
        else:
            print(f"❌ Profile fetch failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Profile fetch error: {e}")
    
    # Test admin login (if exists)
    print("\n6. Testing admin login...")
    admin_login = {
        "email": "admin@example.com",
        "password": "AdminPass123!"
    }
    
    try:
        response = requests.post(f"{AUTH_BASE_URL}/auth/login", json=admin_login)
        if response.status_code == 200:
            admin_result = response.json()
            admin_token = admin_result.get("access_token")
            print(f"✅ Admin login successful: {admin_result['user']['name']}")
            
            # Test getting all users (admin only)
            print("\n7. Testing get all users (admin only)...")
            admin_headers = {"Authorization": f"Bearer {admin_token}"}
            response = requests.get(f"{AUTH_BASE_URL}/auth/users", headers=admin_headers)
            
            if response.status_code == 200:
                users = response.json()
                print(f"✅ All users fetched: {len(users)} users")
                for user in users:
                    print(f"  - {user['name']} ({user['email']}) - Roles: {user['roles']}")
            else:
                print(f"❌ Get users failed: {response.status_code} - {response.text}")
        else:
            print(f"❌ Admin login failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Admin login error: {e}")
    
    print("\n🎉 Auth service test completed!")

if __name__ == "__main__":
    print("🚀 Starting Auth Service Test")
    print("Make sure the auth service is running on http://localhost:9000")
    print("Waiting 3 seconds for service to be ready...")
    time.sleep(3)
    
    test_auth_service()
