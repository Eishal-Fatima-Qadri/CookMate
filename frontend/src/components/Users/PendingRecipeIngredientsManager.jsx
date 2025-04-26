import React from 'react';
import RecipeIngredientsManager from './RecipeIngredientManager.jsx';

export default function PendingRecipeIngredientsManager({ recipeId }) {
    return <RecipeIngredientsManager recipeId={recipeId} pending />;
}
