'use client';

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    const fileType = selectedFile.type;
    if (!fileType.includes('pdf') && !fileType.includes('word') && !fileType.includes('document')) {
      setError('Please upload a PDF or Word document');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      // Handle successful response
      console.log('Resume analysis:', data);
      
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-8 bg-slate-800">
      <header className="w-full flex justify-center mb-8">
        <Image
          src="/inflecton-logo.png"
          alt="Inflection Logo"
          width={300}
          height={75}
          className="h-auto w-auto"
          priority
        />
      </header>
      <main className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-white mb-4">Resume Matcher</h1>
        <p className="text-white text-center text-lg mb-8">
          Upload resume to match against portfolio companies
        </p>
        
        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="bg-white text-slate-800 hover:bg-slate-100 transition-colors px-8 py-4 rounded-lg font-semibold text-lg shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            {file ? 'Change Resume' : 'Select Resume'}
          </label>

          {file && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-white">
                Selected file: {file.name}
              </p>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`bg-green-500 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-green-600 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Analyzing...' : 'Submit for Analysis'}
              </button>
            </div>
          )}

          {error && (
            <p className="text-red-200 bg-red-500/20 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        <div className="mt-8 p-6 bg-white/10 rounded-lg backdrop-blur-sm text-white">
          <h2 className="text-xl font-semibold mb-4">How it works:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Upload resume in PDF or DOCX format</li>
            <li>System analyzes skills and experience</li>
            <li>Match against portfolio company positions</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
