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
    <div className="px-4 py-10 md:px-10 lg:px-32">
      <h2 className="text-3xl font-bold text-green-600 mb-6">
        Recipe Suggestions Based on Your Pantry
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dummyRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-xl p-6 shadow border-l-4 border-green-400"
          >
            <h3 className="text-xl font-semibold text-orange-600 mb-2">
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
