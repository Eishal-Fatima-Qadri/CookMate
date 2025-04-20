import React from 'react';
import Header from '../../components/Admin/AdminHeader.jsx';

export default function AdminDashboard() {
    return (
        <div>
            <Header/>
            <main className="container mx-auto py-8">
                <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                <p>This is a blank admin dashboard page.</p>
                {/* You can add more admin-specific content here */}
            </main>
        </div>
    );
}