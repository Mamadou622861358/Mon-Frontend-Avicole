/**
 * Page FAQ
 */
import React from "react";

const FAQ = () => {
  const items = [
    {
      q: "Comment m'inscrire ?",
      a: "Cliquez sur S'inscrire et remplissez le formulaire.",
    },
    {
      q: "Comment ajouter des produits ?",
      a: "Depuis votre Dashboard producteur, section Produits.",
    },
    {
      q: "Quels moyens de paiement ?",
      a: "Paiement à la livraison (COD) et autres à venir.",
    },
  ];
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">FAQ</h1>
      <div className="space-y-4">
        {items.map((it, idx) => (
          <div key={idx} className="border rounded p-4">
            <h3 className="font-semibold">{it.q}</h3>
            <p className="text-gray-700">{it.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
