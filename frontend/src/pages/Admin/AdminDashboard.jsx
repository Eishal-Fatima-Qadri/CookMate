import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Admin/AdminHeader.jsx';
import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export default function AdminDashboard() {
    // System overview stats
    const [systemStats, setSystemStats] = useState({
        totalUsers: 215,
        activeToday: 43,
        pendingRecipes: 8,
        totalRecipes: 182,
        newUsersThisWeek: 17,
        totalIngredients: 438
    });

    // Recent user activities
    const [userActivities, setUserActivities] = useState([
        { id: 1, user: "john_doe", action: "added a new recipe", item: "Italian Pasta Carbonara", time: "10 minutes ago" },
        { id: 2, user: "kitchen_master", action: "updated their profile", item: "", time: "25 minutes ago" },
        { id: 3, user: "cooking_pro", action: "submitted recipe for review", item: "Thai Green Curry", time: "1 hour ago" },
        { id: 4, user: "lisa_smith", action: "added to pantry", item: "Olive Oil, Garlic, Basil", time: "2 hours ago" },
        { id: 5, user: "taste_explorer", action: "created an account", item: "", time: "3 hours ago" },
        { id: 6, user: "chef_jamie", action: "rated recipe", item: "Chicken Tikka Masala (4.5 stars)", time: "4 hours ago" }
    ]);

    // System alerts
    const [systemAlerts, setSystemAlerts] = useState([
        { id: 1, type: "error", message: "Database backup failed", time: "Yesterday, 11:42 PM" },
        { id: 2, type: "warning", message: "High server load detected", time: "Today, 8:15 AM" },
        { id: 3, type: "info", message: "System update completed successfully", time: "Today, 2:30 AM" },
        { id: 4, type: "success", message: "Weekly analytics report generated", time: "Today, 6:00 AM" }
    ]);

    // Popular recipes
    const [popularRecipes, setPopularRecipes] = useState([
        { id: 1, title: "Chocolate Chip Cookies", views: 342, rating: 4.8 },
        { id: 2, title: "Chicken Alfredo Pasta", views: 289, rating: 4.6 },
        { id: 3, title: "Beef Tacos", views: 257, rating: 4.5 },
        { id: 4, title: "Vegetable Stir Fry", views: 231, rating: 4.2 }
    ]);

    // User growth by month (fake data for chart)
    const [userGrowth, setUserGrowth] = useState({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: [15, 22, 18, 25, 32, 17]
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch data (simulated for this example)
    useEffect(() => {
        // In a real implementation, you would fetch this data from your API
        // For example:
        // const fetchDashboardData = async () => {
        //     setLoading(true);
        //     try {
        //         const [statsRes, activitiesRes, alertsRes, recipesRes] = await Promise.all([
        //             api.get('/admin/stats'),
        //             api.get('/admin/user-activities'),
        //             api.get('/admin/system-alerts'),
        //             api.get('/admin/popular-recipes')
        //         ]);
        //
        //         setSystemStats(statsRes.data);
        //         setUserActivities(activitiesRes.data);
        //         setSystemAlerts(alertsRes.data);
        //         setPopularRecipes(recipesRes.data);
        //     } catch (err) {
        //         setError(`Failed to load dashboard data: ${err.message}`);
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchDashboardData();
    }, []);

    // Helper function to render alert icon based on type
    const renderAlertIcon = (type) => {
        switch (type) {
            case 'error':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'info':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'success':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                            style={{ height: `${(value / maxValue) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-600 mt-1">{userGrowth.labels[index]}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Header />
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
                                Export Report
                            </button>
                            <button
                                className="hover:brightness-110 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 shadow-md"
                                style={{ backgroundColor: "#55B1AB" }}
                                onClick={() => alert('Refreshing dashboard data...')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                Refresh Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 shadow-sm">
                        <div className="flex justify-between items-center">
                            <strong className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Error:
                            </strong> {error}
                            <button
                                className="text-red-600 hover:text-red-900 rounded-full hover:bg-red-100 p-1"
                                onClick={() => setError(null)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {loading ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Total Users */}
                                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                                    <div className="mr-4 bg-blue-100 p-3 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Users</p>
                                        <h3 className="text-2xl font-bold text-gray-800">{systemStats.totalUsers}</h3>
                                        <p className="text-xs text-green-600 mt-1">+{systemStats.newUsersThisWeek} this week</p>
                                    </div>
                                </div>

                                {/* Total Recipes */}
                                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                                    <div className="mr-4 bg-green-100 p-3 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Recipes</p>
                                        <h3 className="text-2xl font-bold text-gray-800">{systemStats.totalRecipes}</h3>
                                        <p className="text-xs text-yellow-600 mt-1">{systemStats.pendingRecipes} pending review</p>
                                    </div>
                                </div>

                                {/* Active Users */}
                                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                                    <div className="mr-4 bg-purple-100 p-3 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Active Today</p>
                                        <h3 className="text-2xl font-bold text-gray-800">{systemStats.activeToday}</h3>
                                        <p className="text-xs text-purple-600 mt-1">{Math.round((systemStats.activeToday / systemStats.totalUsers) * 100)}% of users</p>
                                    </div>
                                </div>
                            </div>

                            {/* User Growth Chart */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">User Growth</h2>
                                    <div className="text-sm text-gray-500">Last 6 months</div>
                                </div>
                                {renderBarChart()}
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold text-gray-800">Recent User Activity</h2>
                                    <Link
                                        to="/admin/activity"
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        View All
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {userActivities.map(activity => (
                                        <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                            <div className="bg-blue-100 text-blue-800 h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm mr-3">
                                                {activity.user.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="font-medium text-gray-900">{activity.user}</span>
                                                        <span className="text-gray-600"> {activity.action}</span>
                                                        {activity.item && (
                                                            <span className="text-gray-900 font-medium"> {activity.item}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">{activity.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            {/* System Alerts */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold text-gray-800">System Alerts</h2>
                                    <button
                                        className="text-sm text-gray-600 hover:text-gray-800"
                                        onClick={() => alert('Clearing all alerts...')}
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {systemAlerts.map(alert => (
                                        <div key={alert.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                            {renderAlertIcon(alert.type)}
                                            <div className="ml-3 flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                                                    <span className="text-xs text-gray-500">{alert.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Popular Recipes */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold text-gray-800">Popular Recipes</h2>
                                    <Link
                                        to="/admin/recipes"
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        View All
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {popularRecipes.map(recipe => (
                                        <div key={recipe.id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{recipe.title}</h3>
                                                <div className="flex items-center mt-1">
                                                    <div className="flex items-center text-yellow-400 mr-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="text-xs text-gray-600">{recipe.rating}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-500 text-xs">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                        </svg>
                                                        {recipe.views} views
                                                    </div>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/admin/recipe/${recipe.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <Link
                                        to="/admin/recipes/pending"
                                        className="bg-amber-50 hover:bg-amber-100 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Review Pending Recipes</span>
                                        <span className="text-xs text-amber-600 mt-1">{systemStats.pendingRecipes} awaiting review</span>
                                    </Link>

                                    <Link
                                        to="/admin/users"
                                        className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Manage Users</span>
                                        <span className="text-xs text-purple-600 mt-1">{systemStats.totalUsers} total users</span>
                                    </Link>

                                    <Link
                                        to="/admin/ingredients"
                                        className="bg-green-50 hover:bg-green-100 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Manage Ingredients</span>
                                        <span className="text-xs text-green-600 mt-1">{systemStats.totalIngredients} total ingredients</span>
                                    </Link>

                                    <Link
                                        to="/admin/reports"
                                        className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Analytics Reports</span>
                                        <span className="text-xs text-blue-600 mt-1">View insights</span>
                                    </Link>
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">System Status</h2>
                                <div className="space-y-4">
                                    {/* CPU Usage */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-600">CPU Usage</span>
                                            <span className="text-sm font-medium text-gray-900">42%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                                        </div>
                                    </div>

                                    {/* Memory Usage */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-600">Memory Usage</span>
                                            <span className="text-sm font-medium text-gray-900">68%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                                        </div>
                                    </div>

                                    {/* System Uptime */}
                                    <div className="pt-2 flex justify-between items-center">
                                        <span className="text-sm text-gray-600">System Uptime</span>
                                        <span className="text-sm font-medium text-gray-900">14d 6h 42m</span>
                                    </div>

                                    {/* Last Backup */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Last Backup</span>
                                        <span className="text-sm font-medium text-gray-900">Yesterday, 11:30 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Pending Recipes */}
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Pending Recipe Submissions</h2>
                        <Link
                            to="/admin/recipes/pending"
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            View All Pending
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Recipe
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Submitted By
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {/* Row 1 */}
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">Thai Green Curry</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">cooking_pro</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">1 hour ago</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            New
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button className="text-blue-600 hover:text-blue-900 mr-3">Review</button>
                                    <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                                    <button className="text-red-600 hover:text-red-900">Reject</button>
                                </td>
                            </tr>

                            {/* Row 2 */}
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">Vegetarian Lasagna</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">lisa_smith</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">3 hours ago</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                            Edit
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button className="text-blue-600 hover:text-blue-900 mr-3">Review</button>
                                    <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                                    <button className="text-red-600 hover:text-red-900">Reject</button>
                                </td>
                            </tr>

                            {/* Row 3 */}
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">Apple Cinnamon Pie</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">chef_jamie</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">5 hours ago</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            New
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button className="text-blue-600 hover:text-blue-900 mr-3">Review</button>
                                    <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                                    <button className="text-red-600 hover:text-red-900">Reject</button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {/* Manage Users */}
                    <Link
                        to="/admin/users"
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex items-center border-l-4 border-blue-500"
                    >
                        <div className="p-3 rounded-full bg-blue-100 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">User Management</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage user accounts, roles and permissions</p>
                        </div>
                    </Link>

                    {/* Content Management */}
                    <Link
                        to="/admin/recipes"
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex items-center border-l-4 border-green-500"
                    >
                        <div className="p-3 rounded-full bg-green-100 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Content Management</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage recipes, ingredients and categories</p>
                        </div>
                    </Link>

                    {/* System Settings */}
                    <Link
                        to="/admin/settings"
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex items-center border-l-4 border-purple-500"
                    >
                        <div className="p-3 rounded-full bg-purple-100 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">System Settings</h3>
                            <p className="text-sm text-gray-500 mt-1">Configure application settings and preferences</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}