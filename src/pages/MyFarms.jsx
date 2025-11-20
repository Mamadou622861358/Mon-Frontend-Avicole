/**
 * Page Mes Fermes - Liste des fermes de l'utilisateur
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { farmService } from "../../services/api";

const MyFarms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await farmService.getAll({});
        setFarms(res.data.data?.docs || res.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes Fermes</h1>
        <Link
          to="/farms/new"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Nouvelle Ferme
        </Link>
      </div>
      {loading ? (
        <p>Chargement…</p>
      ) : farms.length === 0 ? (
        <div className="text-gray-600">
          Aucune ferme encore. Créez votre première ferme.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map((f) => (
            <div key={f._id} className="bg-white rounded shadow p-4">
              <h3 className="font-semibold text-lg">{f.name}</h3>
              <p className="text-sm text-gray-600">{f.description}</p>
              <div className="mt-3 flex gap-2">
                <Link
                  className="text-green-700 hover:underline"
                  to={`/farms/${f._id}`}
                >
                  Voir
                </Link>
                <Link
                  className="text-blue-700 hover:underline"
                  to={`/farms/${f._id}/edit`}
                >
                  Modifier
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFarms;
