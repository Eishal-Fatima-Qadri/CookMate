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

  return (
    <div className="px-4 py-10 md:px-10 lg:px-32 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-orange-600 mb-6">My Pantry</h2>

      <form onSubmit={addIngredient} className="flex gap-4 mb-6">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add an ingredient"
          className="border px-4 py-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition"
        >
          Add
        </button>
      </form>

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ingredients.map((item, index) => (
          <li
            key={index}
            className="bg-white p-4 shadow rounded-xl flex justify-between items-center"
          >
            <span className="text-gray-800 font-medium">{item}</span>
            <button
              onClick={() => removeIngredient(item)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
