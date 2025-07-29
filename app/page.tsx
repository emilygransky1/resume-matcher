'use client';

import { useState } from "react";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';

interface CompanyMatch {
  company: string;
  score: number;
  description?: string;
  reasonsForMatch?: string[];
}

interface ResumeAnalysis {
  summary: string;
  industries: string[];
  modalities: string[];
  companyStages: string[];
  keySkills: string[];
}

interface ResumeResponse {
  success: boolean;
  message?: string;
  analysis?: ResumeAnalysis;
  matches?: CompanyMatch[];
}

function ResultsDisplay({ analysis, matches }: { analysis?: ResumeAnalysis; matches?: CompanyMatch[] }) {
  if (!analysis || !matches) return null;

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Candidate Summary Section */}
      <div className="bg-white/10 rounded-xl border border-white/20 p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-white">Candidate Profile</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300">{analysis.summary}</p>
        </div>
        
        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">Industries</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.industries.map((industry, i) => (
                <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                  {industry}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">Modalities</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.modalities.map((modality, i) => (
                <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                  {modality}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">Preferred Company Stages</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.companyStages.map((stage, i) => (
                <span key={i} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                  {stage}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Company Matches Section */}
      <div className="bg-white/10 rounded-xl border border-white/20 p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Company Matches</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Company</th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">Match Score</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Why This Match?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {matches.map((match, index) => (
                <tr 
                  key={index}
                  className="hover:bg-white/5 transition-colors"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-white">{match.company}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center justify-center">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-semibold text-white">
                            {Math.round(match.score * 100)}%
                          </span>
                        </div>
                        <svg className="transform -rotate-90 w-16 h-16">
                          <circle
                            className="text-white/10"
                            strokeWidth="4"
                            stroke="currentColor"
                            fill="transparent"
                            r="30"
                            cx="32"
                            cy="32"
                          />
                          <circle
                            className="text-blue-500"
                            strokeWidth="4"
                            strokeDasharray={188.5}
                            strokeDashoffset={188.5 - (match.score * 188.5)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="30"
                            cx="32"
                            cy="32"
                          />
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-slate-300">
                      {match.reasonsForMatch?.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2 mb-1">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeResponse | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Check file type - PDF only
    const fileType = selectedFile.type;
    if (!fileType.includes('pdf')) {
      setError('Please upload a PDF file only');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Create form data with the file
      const formData = new FormData();
      formData.append('resume', file, file.name);

      console.log('Sending file:', file.name, file.type, file.size);

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to analyze resume: ' + errorText);
      }

      const data: ResumeResponse = await response.json();
      console.log('Server response:', data);
      
      setResult(data);
      if (!data.success) {
        setError(data.message || 'Failed to analyze resume');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto p-8">
        <header className="w-full flex justify-center mb-12 animate-fade-in">
          <Image
            src="/inflecton-logo.png"
            alt="Inflection Logo"
            width={300}
            height={75}
            className="h-auto w-auto hover:opacity-90 transition-opacity"
            priority
          />
        </header>
        
        <main className="max-w-4xl mx-auto flex flex-col items-center gap-12">
          <div className="text-center space-y-4 animate-fade-in-up">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Resume Matcher</h1>
            <p className="text-xl text-slate-300">Upload your resume to match against portfolio companies</p>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 px-6 py-3 rounded-xl text-blue-300 border border-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <span>Currently accepting PDF files only</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="group bg-white text-slate-800 hover:bg-slate-100 transition-all duration-200 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl flex items-center gap-3 cursor-pointer border-2 border-transparent hover:border-slate-200"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-slate-600 group-hover:text-slate-800 transition-colors" 
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
              {file ? 'Change PDF Resume' : 'Select PDF Resume'}
            </label>

            {file && (
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="flex items-center gap-3 text-slate-300 bg-slate-700/50 px-4 py-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span>{file.name}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`bg-green-500 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:bg-green-600 transition-all duration-200 hover:shadow-xl ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing Resume...</span>
                    </div>
                  ) : 'Submit for Analysis'}
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-200 bg-red-500/20 px-6 py-3 rounded-xl border border-red-500/30 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {result?.success && (
              <ResultsDisplay 
                analysis={result.analysis} 
                matches={result.matches}
              />
            )}
          </div>

          <div className="w-full max-w-2xl p-8 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm text-white animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-2xl font-semibold mb-6">How it works:</h2>
            <ol className="list-none space-y-4">
              <li className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">1</div>
                <span>Upload your resume in PDF format</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">2</div>
                <span>System analyzes skills and experience</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">3</div>
                <span>Match against portfolio companies</span>
              </li>
            </ol>
          </div>
        </main>
      </div>
    </div>
  );
}
