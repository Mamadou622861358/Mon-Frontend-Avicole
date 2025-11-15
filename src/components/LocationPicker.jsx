import { MapPin, Navigation } from "lucide-react";
import React, { useState } from "react";

const LocationPicker = ({
  onLocationChange,
  error = null,
  required = false,
}) => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        onLocationChange({ latitude: lat, longitude: lng });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        let message = "Impossible d'obtenir votre position";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Permission de géolocalisation refusée";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Position non disponible";
            break;
          case error.TIMEOUT:
            message = "Délai d'attente dépassé";
            break;
        }

        alert(message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleLatitudeChange = (e) => {
    const value = e.target.value;
    setLatitude(value);
    if (value && longitude) {
      onLocationChange({
        latitude: parseFloat(value),
        longitude: parseFloat(longitude),
      });
    }
  };

  const handleLongitudeChange = (e) => {
    const value = e.target.value;
    setLongitude(value);
    if (value && latitude) {
      onLocationChange({
        latitude: parseFloat(latitude),
        longitude: parseFloat(value),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Localisation GPS {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="inline-flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <Navigation className="w-4 h-4 mr-1" />
          {isGettingLocation ? "Localisation..." : "Ma position"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={handleLatitudeChange}
            placeholder="Ex: 9.5370"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              error ? "border-red-300" : "border-gray-300"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={handleLongitudeChange}
            placeholder="Ex: -13.6785"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              error ? "border-red-300" : "border-gray-300"
            }`}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {latitude && longitude && (
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            Coordonnées sélectionnées: {latitude}, {longitude}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

