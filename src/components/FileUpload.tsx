import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '@/api/client';
import { toast } from 'sonner';

interface FileUploadProps {
  onUpload: (url: string) => void;
  value?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

const FileUpload = ({ onUpload, value, label, placeholder, className = "" }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const { data } = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUpload(data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{label}</label>}
      <div className="relative group">
        <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary/40 transition-all">
          <div className="w-16 h-16 rounded-xl bg-white border flex items-center justify-center overflow-hidden flex-shrink-0">
            {value ? (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-gray-300" size={24} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 truncate">
              {value ? "Change image" : placeholder || "Select image to upload"}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">JPG, PNG or WEBP (Max 5MB)</p>
          </div>
          <label className="cursor-pointer bg-white border shadow-sm px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
            <span>{isUploading ? 'Uploading...' : 'Browse'}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onUpload('')}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
