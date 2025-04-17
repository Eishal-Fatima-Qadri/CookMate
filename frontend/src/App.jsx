import React from "react";
import {Route, Routes} from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecipeSuggestions from "./pages/RecipeSuggestions";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Pantry from "./pages/pantry";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RecipePage from "./pages/RecipePage.jsx";

export default function App() {
    return (
        <>
            <Header/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/recipes" element={<RecipePage/>}/>
                {/* Protected Routes */}
                <Route element={<ProtectedRoute/>}>
                    <Route path="/pantry" element={<Pantry/>}/>
                </Route>
                <Route
                    path="*"
                    element={
                        <h2 className="text-center mt-20 text-red-500">
                            404 - Page Not Found
                        </h2>
                    }
                />
            </Routes>
            <Footer/>
        </>
    );
}
