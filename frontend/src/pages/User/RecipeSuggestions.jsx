import React from "react";

const dummyRecipes = [
  {
    id: 1,
    name: "Spaghetti Aglio e Olio",
    ingredients: ["Spaghetti", "Garlic", "Olive Oil"],
    time: "20 mins",
    difficulty: "Easy",
  },
  {
    id: 2,
    name: "Chickpea Salad",
    ingredients: ["Chickpeas", "Cucumber", "Tomato", "Lemon"],
    time: "10 mins",
    difficulty: "Easy",
  },
];

export default function RecipeSuggestions() {
  return (
    <div className="min-h-screen bg-[#FFF5F2] px-4 py-12 md:px-10 lg:px-32">
      <h2 className="text-3xl font-bold text-[#55B1AB] mb-8">
        Recipe Suggestions Based on Your Pantry
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dummyRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-xl p-6 shadow border-l-4"
            style={{ borderColor: "#55B1AB" }}
          >
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: "#f87171" }}
            >
              {recipe.name}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Ingredients: {recipe.ingredients.join(", ")}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Cooking Time: {recipe.time}
            </p>
            <p className="text-sm text-gray-600">
              Difficulty: {recipe.difficulty}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
