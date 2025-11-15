/**
 * Page Contact
 */
import React from "react";

const Contact = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contact</h1>
      <p className="text-gray-600 mb-4">
        Vous pouvez nous joindre par email à contact@guineeavicole.com.
      </p>
      <form className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Votre email"
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Sujet"
        />
        <textarea
          className="w-full border rounded px-3 py-2"
          placeholder="Message"
          rows={5}
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default Contact;
