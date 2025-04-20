import React from 'react';
import Header from './AdminHeader';

export default function IngredientDatabase() {
    return (
        <div>
            <Header />
            <main className="container mx-auto py-8">
                <h1 className="text-2xl font-bold mb-4">Ingredient Database</h1>
                <p>This section allows you to manage the ingredient database.</p>
                {/* Add ingredient management features here */}
            </main>
        </div>
    );
}