import { useState } from 'react';
import { Upload, FileText, Zap } from 'lucide-react';
import { Button } from './ui/button';

export function MulkiyaUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Quick Quote</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upload Your Mulkiya
            </h2>
            <p className="text-lg text-gray-600">
              Get an instant quote in just 5 seconds by uploading your vehicle registration
            </p>
          </div>

          <div
            className={`bg-white rounded-2xl p-8 md:p-12 shadow-lg transition-all ${
              isDragging ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!uploadedFile ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drop your Mulkiya here
                </h3>
                <p className="text-gray-600 mb-6">
                  or click to browse your files
                </p>
                <input
                  type="file"
                  id="mulkiya-upload"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                <label htmlFor="mulkiya-upload">
                  <Button size="lg" className="cursor-pointer" asChild>
                    <span>Select File</span>
                  </Button>
                </label>
                <p className="text-sm text-gray-500 mt-4">
                  Supports: JPG, PNG, PDF (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  File Uploaded Successfully
                </h3>
                <p className="text-gray-600 mb-6">{uploadedFile.name}</p>
                <div className="flex gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => {
                      // Handle quote generation
                      alert('Processing your Mulkiya...');
                    }}
                  >
                    Get Quote Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setUploadedFile(null)}
                  >
                    Upload Different File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
