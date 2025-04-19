import React, {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function AdminSignup() {
    const [formData, setFormData] = useState({
        username: "", email: "", password: "", adminSecret: "", // New field for admin secret
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {username, email, password, adminSecret} = formData;

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/users/register/admin', {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({username, email, password, adminSecret}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Admin signup failed');
            }

            // Optionally, redirect the admin to a specific admin dashboard
            navigate('/admin-dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (<div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold text-indigo-600 mb-6 text-center">
                Admin Sign Up
            </h2>

            {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
            </div>)}

            <form className=" space-y-4" onSubmit={handleSubmit}>
                <input
                    type=" text"
                    name=" username"
                    placeholder=" Username"
                    value={username}
                    onChange={handleChange}
                    className=" w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2
                         focus:ring-indigo-400"
                    required
                />
                <input
                    type=" email"
                    name=" email"
                    placeholder=" Email"
                    value={email}
                    onChange={handleChange}
                    className=" w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2
                         focus:ring-indigo-400"
                    required
                />
                <input
                    type=" password"
                    name=" password"
                    placeholder=" Password"
                    value={password}
                    onChange={handleChange}
                    className=" w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2
                         focus:ring-indigo-400"
                    required
                />
                <input
                    type=" password"
                    name=" adminSecret"
                    placeholder=" Admin Secret Key"
                    value={adminSecret}
                    onChange={handleChange}
                    className=" w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2
                         focus:ring-indigo-400"
                    required
                />
                <button
                    type=" submit"
                    className=" w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 transition"
                    disabled={loading}
                >
                    {loading ? " Signing up..." : " Sign Up as Admin"}
                </button>
            </form>
            <p className=" mt-4 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/login" className=" text-indigo-500 hover:underline">
                    Log in
                </a>
            </p>
        </div>
    </div>);
}