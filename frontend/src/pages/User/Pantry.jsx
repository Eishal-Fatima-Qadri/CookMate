import React, { useState } from "react";

export default function Pantry() {
  const [ingredients, setIngredients] = useState([
    "Eggs",
    "Milk",
    "Flour",
    "Tomatoes",
  ]);
  const [newItem, setNewItem] = useState("");

  const addIngredient = (e) => {
    e.preventDefault();
    if (newItem.trim() !== "") {
      setIngredients([...ingredients, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeIngredient = (item) => {
    setIngredients(ingredients.filter((i) => i !== item));
  };

  const emojiMap = {
    tomato: "🍅",
    onion: "🧅",
    garlic: "🧄",
    carrot: "🥕",
    potato: "🥔",
    chicken: "🍗",
    beef: "🥩",
    fish: "🐟",
    cheese: "🧀",
    bread: "🍞",
    rice: "🍚",
    egg: "🥚",
    milk: "🥛",
    lemon: "🍋",
    banana: "🍌",
    apple: "🍎",
    lettuce: "🥬",
    cucumber: "🥒",
    pepper: "🌶️",
    salt: "🧂",
    // fallback or more items
  };

  const getEmojiForIngredient = (item) => {
    const name = item.toLowerCase();
    for (const key in emojiMap) {
      if (name.includes(key)) {
        return emojiMap[key];
      }
    }
    return "🧺"; // default fallback emoji
  };

  return (
    <div className="bg-[#FDFBFA] min-h-screen py-10 px-4 flex justify-center items-start transition-all">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl p-6 md:p-12 lg:p-16 border border-gray-100">
        <h2 className="text-3xl font-bold text-[#55B1AB] mb-6">My Pantry</h2>

        {/* Add Ingredient Form */}
        <form
          onSubmit={addIngredient}
          className="flex flex-col sm:flex-row gap-4 mb-10"
          aria-label="Add ingredient form"
        >
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="e.g., Garlic, Oats, Eggs"
            className="border border-[#55B1AB] px-4 py-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-[#55B1AB] shadow-sm text-[#131A24] placeholder-gray-400"
            aria-label="Ingredient name"
          />
          <button
            type="submit"
            className="bg-[#7A5AFF] text-white px-6 py-3 rounded-lg hover:bg-[#6B4EE2] transition-all font-semibold shadow-md"
            aria-label="Add ingredient"
          >
            Add
          </button>
        </form>

        {/* Ingredient List */}
        {ingredients.length === 0 ? (
          <p className="text-gray-400 text-center">
            Your pantry is empty. Add some ingredients to get started!
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ingredients.map((item, index) => (
              <li
                key={index}
                className="relative bg-[#FFF9F9] border border-[#F87171]/30 p-5 rounded-xl shadow-sm flex items-start justify-between hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#F87171] text-lg">
                    {getEmojiForIngredient(item)}
                  </div>
                  <span className="text-[#131A24] font-medium">{item}</span>
                </div>

                <button
                  onClick={() => removeIngredient(item)}
                  className="text-sm text-[#F87171] font-semibold opacity-80 hover:opacity-100 transition"
                  aria-label={`Remove ${item}`}
                >
                  ✕
                </button>

                <div className="absolute top-0 left-0 h-full w-1 rounded-l-xl bg-[#F87171] opacity-50" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
