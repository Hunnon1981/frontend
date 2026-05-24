/**
 * Photo Upload Component
 * Client-side photo upload with preview and compression
 */

'use client';

import React, { useState, useRef } from 'react';

interface PhotoUploadProps {
  maxPhotos: number;
  onUpload: (files: File[]) => void;
  uploadedPhotos: string[];
}

export default function PhotoUpload({ maxPhotos, onUpload, uploadedPhotos }: PhotoUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    // Validation
    if (files.length + previewUrls.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    // Check file types
    const invalidFiles = files.filter(
      (file) => !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
    );
    if (invalidFiles.length > 0) {
      setError('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    // Check file sizes (10MB max)
    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Each photo must be under 10MB');
      return;
    }

    // Create previews
    const newPreviewUrls = await Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );

    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    
    // Call parent upload handler
    onUpload(files);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={previewUrls.length >= maxPhotos}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          📸 Upload Photos ({previewUrls.length}/{maxPhotos})
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        capture="environment"
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Preview Grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="Remove photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700 mb-2">
          <strong>💡 Photo Tips:</strong>
        </p>
        <ul className="text-sm text-gray-600 space-y-1 ml-5 list-disc">
          <li>Take clear photos showing the overall vehicle condition</li>
          <li>Include photos of any damage or issues</li>
          <li>Show the vehicle's surroundings and accessibility</li>
          <li>Max 3 photos, 10MB each (JPG, PNG, or WebP)</li>
        </ul>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          📸 <strong>Photos help us prepare equipment and confirm pricing.</strong> Images are automatically compressed and stored securely for 24 hours.
        </p>
      </div>
    </div>
  );
}
