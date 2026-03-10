import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Input, Button } from '../components/ui';
import { Image as ImageIcon, Loader2, UploadCloud, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ImageAnalyzer = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !imagePreview) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Extract base64 data without the prefix
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imageFile.type;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: 'Analyze this property image. Provide a detailed description, highlight key architectural features, estimate its condition, and suggest potential improvements or selling points.',
            },
          ],
        },
      });

      setAnalysis(response.text || "No analysis generated.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while analyzing the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl py-8">
      <div className="mb-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
          <ImageIcon className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          AI Property Analyzer
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Upload a photo of a property and let our advanced AI analyze its features, condition, and potential value.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 flex flex-col items-center justify-center min-h-[400px]">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          {imagePreview ? (
            <div className="w-full space-y-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md bg-slate-100">
                <img 
                  src={imagePreview} 
                  alt="Property Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                  Change Image
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 gap-2" 
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Analyze Now</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-16 w-16 text-emerald-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Upload Property Image</h3>
              <p className="text-sm text-slate-500 mt-2">Click to browse or drag and drop</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
            </div>
          )}
          
          {error && (
            <div className="mt-6 w-full rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-slate-50 p-8 min-h-[400px] ring-1 ring-slate-200">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-slate-900">Analysis Results</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              <p className="text-sm font-medium animate-pulse">Our AI is examining the property details...</p>
            </div>
          ) : analysis ? (
            <div className="prose prose-slate prose-sm max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4 text-center">
              <Sparkles className="h-12 w-12 opacity-50" />
              <div>
                <p className="font-medium text-slate-600">No analysis yet</p>
                <p className="text-sm mt-1">Upload an image and click analyze to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
