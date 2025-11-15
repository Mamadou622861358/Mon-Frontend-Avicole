import React, { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';

const ImageUpload = ({ 
  currentImage, 
  onImageChange, 
  className = "", 
  multiple = false,
  maxFiles = 5,
  acceptedTypes = "image/*"
}) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [previews, setPreviews] = useState(currentImage ? (Array.isArray(currentImage) ? currentImage : [currentImage]) : []);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    if (multiple) {
      if (files.length + previews.length > maxFiles) {
        alert(`Vous ne pouvez télécharger que ${maxFiles} images maximum`);
        return;
      }
      
      const newPreviews = [];
      const fileReaders = [];
      
      files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          fileReaders.push(reader);
          
          reader.onload = (e) => {
            newPreviews[index] = e.target.result;
            
            // Vérifier si tous les fichiers ont été lus
            if (newPreviews.filter(Boolean).length === files.length) {
              const updatedPreviews = [...previews, ...newPreviews];
              setPreviews(updatedPreviews);
              onImageChange(updatedPreviews);
            }
          };
          
          reader.readAsDataURL(file);
        }
      });
    } else {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target.result);
          onImageChange(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index = null) => {
    if (multiple && index !== null) {
      const updatedPreviews = previews.filter((_, i) => i !== index);
      setPreviews(updatedPreviews);
      onImageChange(updatedPreviews);
    } else {
      setPreview(null);
      onImageChange(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (multiple) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          
          {previews.length < maxFiles && (
            <div
              onClick={triggerFileInput}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Ajouter une image</span>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <p className="text-xs text-gray-500">
          {previews.length}/{maxFiles} images • Formats acceptés: JPG, PNG, GIF
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={() => removeImage()}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
        >
          <Camera className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-xs text-gray-500 text-center">Ajouter une photo</span>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
