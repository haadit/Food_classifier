import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Camera } from "lucide-react";
import CameraCapture from "./CameraCapture";
import "./ImageUpload.css";

const ImageUpload = ({ onImageSelect, selectedImage, isLoading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        onImageSelect(file);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleCameraSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Indicate this was captured via camera so caller can auto-analyze
      onImageSelect(file, { autoAnalyze: true });
    }
  };

  const handleRemoveImage = () => {
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatClassName = (className) => {
    return className
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="image-upload-container">
      {!selectedImage ? (
        <>
          <div
            className={`upload-area ${isDragOver ? "drag-over" : ""} ${
              isLoading ? "loading" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
          >
            <div className="upload-content">
              <div className="upload-icon">
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <Upload size={48} />
                )}
              </div>
              <h3 className="upload-title">
                {isLoading ? "Processing..." : "Upload Food Image"}
              </h3>
              <p className="upload-description">
                Drag and drop an image here, or click to browse
              </p>
              <p className="upload-formats">Supports: JPG, PNG, GIF, WebP</p>
              <div
                className="upload-actions"
                style={{ justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  className="camera-button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    if (!isLoading) setShowCamera(true);
                  }}
                  disabled={isLoading}
                >
                  <Camera size={16} /> Use Camera
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
              disabled={isLoading}
            />
            {/* hidden file capture kept as fallback */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraSelect}
              style={{ display: "none" }}
              disabled={isLoading}
            />
          </div>
          <CameraCapture
            open={showCamera}
            onClose={() => setShowCamera(false)}
            onCapture={(file) => onImageSelect(file, { autoAnalyze: true })}
          />
        </>
      ) : (
        <div className="image-preview-container">
          <div className="image-preview">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Selected food"
              className="preview-image"
            />
            <button
              className="remove-image-btn"
              onClick={handleRemoveImage}
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>
          <div className="image-info">
            <div className="image-details">
              <ImageIcon size={16} />
              <span className="image-name">{selectedImage.name}</span>
            </div>
            <div className="image-size">
              {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
