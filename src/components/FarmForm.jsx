import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const FarmForm = ({ farm, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    images: [],
    specialties: []
  });
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || '',
        description: farm.description || '',
        address: farm.address || '',
        phone: farm.phone || '',
        email: farm.email || '',
        images: [],
        specialties: farm.specialties || []
      });
      if (farm.images) {
        setImagesPreviews(farm.images.map(img => ({ url: `/uploads/farms/${img}`, file: null })));
      }
    }
  }, [farm]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const invalidFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} dépasse la taille maximale de 5MB`);
        return true;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError(`${file.name} n'est pas au format JPG, JPEG ou PNG`);
        return true;
      }
      return false;
    });

    if (invalidFiles.length > 0) return;

    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      file: file
    }));

    setImagesPreviews([...imagesPreviews, ...newPreviews]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
    setError('');
  };

  const removeImage = (index) => {
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSpecialtyChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(value)
        ? prev.specialties.filter(s => s !== value)
        : [...prev.specialties, value]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'images') {
        formData.images.forEach(image => {
          formDataToSend.append('images', image);
        });
      } else if (key === 'specialties') {
        formData.specialties.forEach(specialty => {
          formDataToSend.append('specialties[]', specialty);
        });
      } else if (formData[key] !== '') {
        formDataToSend.append(key, formData[key]);
      }
    });

    onSubmit(formDataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {farm ? 'Modifier la ferme' : 'Ajouter une ferme'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom de la ferme</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Spécialités</label>
              <div className="grid grid-cols-2 gap-4">
                {['Poulets de chair', 'Poules pondeuses', 'Poussins', 'Œufs', 'Aliments', 'Équipements'].map(specialty => (
                  <label key={specialty} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={specialty}
                      checked={formData.specialties.includes(specialty)}
                      onChange={handleSpecialtyChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Images de la ferme</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagesPreviews.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={`Aperçu ${index + 1}`}
                      className="h-24 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {farm ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmForm;