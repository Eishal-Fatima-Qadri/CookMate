import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dietary_preferences: '',
    allergens: '',
    favorite_cuisines: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        dietary_preferences: formData.dietary_preferences,
        allergens: formData.allergens,
        favorite_cuisines: formData.favorite_cuisines
      });

      setSuccessMessage('Registration successful! Redirecting to login...');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Registration failed');
      } else {
        setError('Unable to connect to server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <Link to="/" className="inline-block">
                <h2 className="text-3xl font-bold" style={{ color: "#55B1AB" }}>CookMate</h2>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Create your account</h1>
              <p className="text-gray-600">Join our cooking community today</p>
            </div>

            {successMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {successMessage}
                </div>
            )}

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Choose a username"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Create a password"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dietary_preferences" className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Preferences <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                    id="dietary_preferences"
                    name="dietary_preferences"
                    type="text"
                    value={formData.dietary_preferences}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Vegetarian, Vegan, Gluten-free, etc."
                />
              </div>

              <div>
                <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-1">
                  Allergens <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                    id="allergens"
                    name="allergens"
                    type="text"
                    value={formData.allergens}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Nuts, Dairy, Shellfish, etc."
                />
              </div>

              <div>
                <label htmlFor="favorite_cuisines" className="block text-sm font-medium text-gray-700 mb-1">
                  Favorite Cuisines <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                    id="favorite_cuisines"
                    name="favorite_cuisines"
                    type="text"
                    value={formData.favorite_cuisines}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Italian, Mexican, Thai, etc."
                />
              </div>

              <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full hover:brightness-110 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
                    style={{ backgroundColor: "#55B1AB" }}
                >
                  {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                  ) : "Create Account"}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
  );
}