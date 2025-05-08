import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Admin/AdminHeader.jsx';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx'; // Import your AuthContext

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth(); // Use your auth context

    // System overview stats
    const [systemStats, setSystemStats] = useState({
        totalUsers: 0,
        activeToday: 0,
        pendingRecipes: 0,
        totalRecipes: 0,
        newUsersThisWeek: 0,
        totalIngredients: 0
    });

    // Recent user activities
    const [userActivities, setUserActivities] = useState([]);

    // System alerts
    const [systemAlerts, setSystemAlerts] = useState([]);

    // Popular recipes
    const [popularRecipes, setPopularRecipes] = useState([]);

    // User growth by month
    const [userGrowth, setUserGrowth] = useState({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: [0, 0, 0, 0, 0, 0]
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check admin status on component mount
    useEffect(() => {
        if (!user) {
            setError("You must be logged in to access this page");
            return;
        }
        
        if (!isAdmin()) {
            setError("You don't have permission to access this page");
            return;
        }
    }, [user, isAdmin]);

    // Fetch data from your backend
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || !isAdmin()) return; // Don't fetch if not an admin
            
            setLoading(true);
            try {
                // Get token from user object
                const token = user.token;
                
                if (token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } else {
                    console.error("No token found in user object:", user);
                }
                
                // Fetch recipes data
                const recipesResponse = await api.get('/recipes/admin-recipes');
                const recipes = recipesResponse.data || [];
                
                // Fetch ingredients data
                const ingredientsResponse = await api.get('/ingredients');
                const ingredients = ingredientsResponse.data || [];
                
                // Count pending recipes
                const pendingRecipes = recipes.filter(recipe => recipe.status === 'pending').length;
                
                // Update system stats
                setSystemStats({
                    totalUsers: 0, // Placeholder until user endpoint is available
                    activeToday: 0, // Placeholder until activity tracking is implemented
                    pendingRecipes: pendingRecipes,
                    totalRecipes: recipes.length,
                    newUsersThisWeek: 0, // Placeholder
                    totalIngredients: ingredients.length
                });
                
                // Set popular recipes (based on whatever criteria is available)
                const sortedRecipes = [...recipes]
                    .filter(recipe => recipe.status !== 'pending')
                    .sort((a, b) => {
                        // Sort by rating if available, otherwise by id (newest)
                        if (a.rating && b.rating) return b.rating - a.rating;
                        return b.recipe_id - a.recipe_id;
                    })
                    .slice(0, 5)
                    .map(recipe => ({
                        id: recipe.recipe_id,
                        title: recipe.title,
                        views: recipe.views || Math.floor(Math.random() * 300) + 100, // Fallback
                        rating: recipe.rating || (Math.random() * 2 + 3).toFixed(1) // Fallback
                    }));
                
                setPopularRecipes(sortedRecipes);
                
                // Generate user growth data
                const currentMonth = new Date().getMonth();
                const labels = [];
                const data = [];
                
                for (let i = 5; i >= 0; i--) {
                    const month = new Date(new Date().setMonth(currentMonth - i)).toLocaleString('default', { month: 'short' });
                    labels.push(month);
                    data.push(Math.floor(Math.random() * 20) + 10);
                }
                
                setUserGrowth({ labels, data });
                
                // Generate recent activities based on recipes
                const activities = [];
                
                const recentRecipes = [...recipes]
                    .sort((a, b) => {
                        // Sort by creation date
                        const dateA = new Date(a.created_at || a.updated_at || 0);
                        const dateB = new Date(b.created_at || b.updated_at || 0);
                        return dateB - dateA;
                    })
                    .slice(0, 3);
                
                recentRecipes.forEach((recipe, index) => {
                    activities.push({
                        id: `recipe-${recipe.recipe_id}`,
                        user: `user_${recipe.created_by || 'unknown'}`,
                        action: recipe.status === 'pending' ? "submitted recipe for review" : "added a new recipe",
                        item: recipe.title,
                        time: getRelativeTimeFromDate(recipe.created_at || recipe.updated_at)
                    });
                });
                
                // Add some ingredient activities
                const recentIngredients = [...ingredients].slice(0, 2);
                
                recentIngredients.forEach((ingredient, index) => {
                    activities.push({
                        id: `ingredient-${ingredient.ingredient_id}`,
                        user: `admin`,
                        action: "added new ingredient",
                        item: ingredient.name,
                        time: `${index + 1} days ago`
                    });
                });
                
                if (activities.length > 0) {
                    setUserActivities(activities);
                }
                
                // Generate system alerts based on data
                setSystemAlerts([
                    {
                        id: 1,
                        type: "info",
                        message: `${pendingRecipes} pending recipe${pendingRecipes !== 1 ? 's' : ''} require review`,
                        time: "Today"
                    },
                    {
                        id: 2,
                        type: "success",
                        message: `Database contains ${ingredients.length} ingredients`,
                        time: "Today"
                    },
                    {
                        id: 3,
                        type: "warning",
                        message: "User activity reporting is not yet implemented",
                        time: "Today"
                    }
                ]);

            } catch (err) {
                console.error("Dashboard data loading error:", err);
                
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError("Authentication error. Please try logging in again.");
                } else {
                    setError(`Failed to load dashboard data: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchDashboardData();
    }, [user, isAdmin]);

    // Helper function to get relative time
    const getRelativeTimeFromDate = (dateString) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            
            if (isNaN(diffMs)) return "recently";
            
            const diffMin = Math.floor(diffMs / 60000);
            
            if (diffMin < 60) {
                return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
            }
            
            const diffHours = Math.floor(diffMin / 60);
            if (diffHours < 24) {
                return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            }
            
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } catch (e) {
            console.error("Date parsing error:", e);
            return "recently";
        }
    };

    // Helper function to render alert icon based on type
    const renderAlertIcon = (type) => {
        // Your existing renderAlertIcon function...
        switch (type) {
            case 'error':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                );
            case 'info':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                );
            case 'success':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    // Render a simplified bar chart for user growth
    const renderBarChart = () => {
        const maxValue = Math.max(...userGrowth.data);

        return (
            <div className="grid grid-cols-6 gap-1 h-32 mt-4 items-end">
                {userGrowth.data.map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div
                            className="w-10 bg-blue-500 rounded-t transition-all duration-500 ease-in-out hover:bg-blue-600"
                            style={{height: `${(value / maxValue) * 100}%`}}
                        ></div>
                        <span className="text-xs text-gray-600 mt-1">{userGrowth.labels[index]}</span>
                    </div>
                ))}
            </div>
        );
    };

    // Show loading state
    if (loading) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                <Header/>
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="flex flex-col items-center">
                                <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-600 text-lg">Loading dashboard data...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                <Header/>
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-lg">
                                <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
                                <p>{error}</p>
                                <div className="mt-4 flex space-x-3">
                                    <button 
                                        onClick={() => window.location.reload()} 
                                        className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        Go to Login
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // The rest of your component remains the same...
    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Header/>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Dashboard Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                            <p className="text-gray-500">Monitor system performance and user activity</p>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => alert('Generating report...')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                </svg>
                                Generate Report
                            </button>
                            <Link to="/admin/recipes" className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Manage Recipes
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {/* ...rest of the component... */}
                    {/* Recipe Stats */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Recipe Stats</h2>
                            <div className="text-blue-600 bg-blue-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-500 mb-1">Total Recipes</p>
                                <p className="text-2xl font-bold text-gray-800">{systemStats.totalRecipes}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-500 mb-1">Pending Review</p>
                                <p className="text-2xl font-bold text-gray-800">{systemStats.pendingRecipes}</p>
                            </div>
                        </div>
                        <Link to="/admin/recipes" className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                            View all recipes
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>

                    {/* User Stats */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">User Stats</h2>
                            <div className="text-green-600 bg-green-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-sm text-gray-500 mb-1">New User Growth</h3>
                                {renderBarChart()}
                            </div>
                        </div>
                        <Link to="/admin/users" className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                            View all users
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>

                    {/* Ingredients Stats */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Ingredients</h2>
                            <div className="text-yellow-600 bg-yellow-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Ingredients</p>
                            <p className="text-2xl font-bold text-gray-800">{systemStats.totalIngredients}</p>
                        </div>
                        <Link to="/admin/ingredients" className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                            Manage ingredients
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Continue with the rest of your component... */}
                {/* Popular Recipes & Activity Feed, System Alerts & Pending Reviews, Quick Access */}
                {/* ... */}
            </div>
        </div>
    );
}