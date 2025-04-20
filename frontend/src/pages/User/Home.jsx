// pages/Home.jsx
import React from "react";
import {Link} from "react-router-dom";
import foodJpg from "../../food-hero.jpg";

export default function Home() {
    return (
        <div className="text-center py-20 px-4 md:px-10 lg:px-32">
            <h1 className="text-5xl font-extrabold text-orange-600 mb-6">
                Welcome to CookMate!
            </h1>
            <p className="text-xl text-gray-700 mb-8">
                Discover delicious recipes based on the ingredients you already have.
                CookMate helps you manage your pantry, track your meals, and explore new
                culinary creations.
            </p>

            {/* Hero Image Placeholder */}
            <div
                className="w-full h-64 bg-yellow-200 rounded-xl shadow-md mb-8 flex items-center justify-center overflow-hidden">
                <img src={foodJpg} className="w-full"/>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-6">
                <Link
                    to="/register"
                    className="bg-orange-500 text-white px-6 py-3 rounded-full shadow hover:bg-orange-600 transition"
                >
                    Get Started
                </Link>
                <Link
                    to="/recipes"
                    className="bg-green-500 text-white px-6 py-3 rounded-full shadow hover:bg-green-600 transition"
                >
                    Explore Recipes
                </Link>
            </div>

            {/* Feature Cards */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-orange-300">
                    <h3 className="text-lg font-semibold text-orange-600 mb-2">
                        Smart Pantry
                    </h3>
                    <p className="text-gray-600">
                        Keep track of ingredients and their expiration dates with ease.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-300">
                    <h3 className="text-lg font-semibold text-yellow-600 mb-2">
                        Recipe Suggestions
                    </h3>
                    <p className="text-gray-600">
                        Get recipe ideas tailored to what's in your kitchen.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-300">
                    <h3 className="text-lg font-semibold text-green-600 mb-2">
                        Nutrition Insights
                    </h3>
                    <p className="text-gray-600">
                        Track your meals and stay aligned with your health goals.
                    </p>
                </div>
            </div>
        </div>
    );
}
