/**
 * Page Centre d'aide
 */
import React from "react";

const Help = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Centre d'aide</h1>
      <p className="text-gray-600 mb-4">
        Besoin d'aide ? Consultez la FAQ ou contactez-nous.
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Comment créer un compte producteur</li>
        <li>Comment ajouter des produits</li>
        <li>Comment suivre vos commandes</li>
      </ul>
    </div>
  );
};

export default Help;
