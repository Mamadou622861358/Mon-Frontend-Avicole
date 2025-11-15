import React, { useState } from "react";
import { authService } from "../services/api";

const AuthTest = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testRegister = async () => {
    setLoading(true);
    setResult("Test d'inscription en cours...");

    const testData = {
      firstName: "Mamadou",
      lastName: "Diallo",
      email: "mamadou.diallo@example.com",
      phone: "224123456789",
      password: "MotDePasse123",
      city: "Conakry",
      district: "Kaloum",
      role: "client",
    };

    try {
      console.log("Données envoyées:", testData);
      const response = await authService.register(testData);

      setResult(
        `Inscription réussie: ${JSON.stringify(response.data, null, 2)}`
      );
    } catch (error) {
      console.error("Erreur complète:", error);
      setResult(
        `Erreur d'inscription: ${JSON.stringify(
          error.response?.data || error.message,
          null,
          2
        )}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setResult("Test de connexion en cours...");

    try {
      const response = await authService.login({
        email: "mamadou.diallo@example.com",
        password: "MotDePasse123",
      });

      setResult(`Connexion réussie: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(
        `Erreur de connexion: ${JSON.stringify(
          error.response?.data || error.message,
          null,
          2
        )}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testRegisterProducteur = async () => {
    setLoading(true);
    setResult("Test d'inscription producteur en cours...");

    const testData = {
      firstName: "Fatou",
      lastName: "Camara",
      email: "fatou.camara@example.com",
      phone: "224987654321",
      password: "Producteur2024!",
      city: "Kankan",
      district: "Kankan",
      role: "producteur",
      farmName: "Ferme Avicole de Kankan",
    };

    try {
      console.log("Données envoyées (producteur):", testData);
      const response = await authService.register(testData);

      setResult(
        `Inscription producteur réussie: ${JSON.stringify(
          response.data,
          null,
          2
        )}`
      );
    } catch (error) {
      console.error("Erreur complète:", error);
      setResult(
        `Erreur d'inscription producteur: ${JSON.stringify(
          error.response?.data || error.message,
          null,
          2
        )}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test d'Authentification</h1>

      <div className="space-y-4 mb-6">
        <button
          onClick={testRegister}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Tester l'inscription (Client)
        </button>

        <button
          onClick={testRegisterProducteur}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 ml-4"
        >
          Tester l'inscription (Producteur)
        </button>

        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          Tester la connexion
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Résultat:</h2>
        <pre className="text-sm overflow-auto">{result}</pre>
      </div>
    </div>
  );
};

export default AuthTest;
