'use client';

import { useEffect, useState } from 'react';
import axios from './config/axios';  // Adjust to the correct path for axios configuration
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';  // To navigate between pages

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Initialize as false

  useEffect(() => {
    // Check if we're running in the browser and if there's a token in localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);  // Set logged-in state based on token existence
    }
  }, []);

  const handleLogin = async () => {
    try {
      // Make a POST request to the login endpoint
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      // Extract token from response
      const { token } = response.data;

      // Store the token in localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }

      // Clear any errors
      setError('');
      setIsLoggedIn(true);  // Set login state to true

      // Redirect the user to a protected route (e.g., rooms)
      window.location.href = '/rooms';
    } catch (err) {
      // If login fails, show an error message
      setError('Invalid credentials. Please try again.');
      console.error(err);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');  // Clear the token
    }
    setIsLoggedIn(false);  // Set login state to false
    window.location.href = '/';  // Redirect to the login page
  };

  return (
    <div className="container mx-auto p-8">
      {/* Header with navigation */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <nav className="space-x-4">
          {!isLoggedIn ? (
            <Link href="/">
              <Button>Login</Button>
            </Link>
          ) : (
            <>
              <Link href="/rooms">
                <Button>Rooms</Button>
              </Link>
              <Link href="/assign">
                <Button>Assign</Button>
              </Link>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </nav>
      </header>

      {/* Login form */}
      {!isLoggedIn ? (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 w-full"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6 w-full"
          />
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold">You are already logged in.</h2>
          <p>Use the navigation above to manage rooms or assign users.</p>
        </div>
      )}
    </div>
  );
}
