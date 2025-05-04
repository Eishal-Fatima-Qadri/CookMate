// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImg from "../../assets/food-hero.jpg";

export default function Home() {
  return (
    <div className="bg-[#FFF5F2] min-h-screen py-16 px-6 lg:px-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#FFE8E5] rounded-3xl shadow-lg p-10 flex flex-col lg:flex-row items-center justify-between"
      >
        {/* Text */}
        <div className="max-w-xl">
          <h1 className="text-5xl font-extrabold text-[#1E2A39] mb-4">
            Welcome to{" "}
            <span className="text-400" style={{ color: "#f87171" }}>
              CookMate!
            </span>
          </h1>
          <p className="text-lg text-slate-700 mb-6">
            Discover delicious recipes based on the ingredients you already
            have. CookMate helps you manage your pantry, track your meals, and
            explore new culinary creations.
          </p>
          <Link
            to="/recipes"
            className="hover:underline font-semibold"
            style={{ color: "#f87171" }}
          >
            My recipes →
          </Link>
        </div>

        {/* Image */}
        <div className="max-w-sm lg:max-w-md w-full">
          <motion.img
            src={heroImg}
            alt="Hero Chef"
            className="w-full h-auto rounded-xl object-contain"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className="mt-20 grid gap-8 md:grid-cols-3">
        {[
          {
            title: "Smart Pantry",
            desc: "Track ingredients and expiration dates effortlessly.",
            color: "border-cyan-400 text-cyan-600",
          },
          {
            title: "Recipe Suggestions",
            desc: "Ideas based on what’s already in your kitchen.",
            color: "border-rose-400 text-rose-600",
          },
          {
            title: "Nutrition Insights",
            desc: "Monitor meals and align with health goals.",
            color: "border-indigo-400 text-indigo-600",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            className={`bg-white p-6 rounded-2xl shadow border-t-4 ${card.color}`}
            whileHover={{ scale: 1.03 }}
          >
            <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
            <p className="text-gray-600">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
