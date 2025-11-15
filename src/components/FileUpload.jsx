import { Camera, FileText, X } from "lucide-react";
import React, { useRef, useState } from "react";

const FileUpload = ({
  label,
  accept = "image/*",
  multiple = false,
  maxFiles = 1,
  onFilesChange,
  required = false,
  error = null,
  preview = true,
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);

    if (multiple) {
      const newFiles = [...files, ...fileArray].slice(0, maxFiles);
      setFiles(newFiles);
      onFilesChange(newFiles);
    } else {
      setFiles(fileArray);
      onFilesChange(fileArray);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const getIcon = () => {
    if (accept.includes("image")) return <Camera className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-green-400 bg-green-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        <div className="space-y-2">
          {getIcon()}
          <div className="text-sm text-gray-600">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-green-600 hover:text-green-500 font-medium"
            >
              Cliquez pour sélectionner
            </button>{" "}
            ou glissez-déposez vos fichiers ici
          </div>
          <p className="text-xs text-gray-500">
            {accept.includes("image")
              ? "Images (JPG, PNG, GIF)"
              : "Documents (PDF, DOC, DOCX)"}{" "}
            - Max 5MB
          </p>
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {preview && files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Fichiers sélectionnés:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded border"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded border flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

