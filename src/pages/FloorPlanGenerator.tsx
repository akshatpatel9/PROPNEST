import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Input, Button } from '../components/ui';
import { PenTool, Loader2, Maximize, Home, Sparkles } from 'lucide-react';

export const FloorPlanGenerator = () => {
  const [plotSize, setPlotSize] = useState('');
  const [necessities, setNecessities] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotSize || !necessities) return;

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `A professional, clean, top-down architectural floor plan blueprint for a plot size of ${plotSize}. Necessities: ${necessities}. The floor plan should be detailed, showing rooms, doors, windows, and basic furniture layout. High contrast, blueprint style, architectural drawing.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setImageUrl(`data:image/png;base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        setError("Could not generate image. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while generating the floor plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
          <PenTool className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          AI Floor Plan Generator
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Envision your dream home. Enter your plot size and requirements, and our AI will generate a custom architectural floor plan for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Maximize className="h-4 w-4" /> Plot Size
              </label>
              <Input
                required
                value={plotSize}
                onChange={e => setPlotSize(e.target.value)}
                placeholder="e.g. 40x60 ft, 2400 sqft"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Home className="h-4 w-4" /> Necessities & Requirements
              </label>
              <textarea
                required
                rows={5}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={necessities}
                onChange={e => setNecessities(e.target.value)}
                placeholder="e.g. 3 bedrooms, 2 bathrooms, open kitchen, large living room, garage for 2 cars, garden space..."
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-12 text-base gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" /> Generate Floor Plan
                </>
              )}
            </Button>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="rounded-3xl bg-slate-100 p-8 flex flex-col items-center justify-center min-h-[400px] ring-1 ring-slate-200 border-dashed border-2 border-slate-300">
          {loading ? (
            <div className="flex flex-col items-center text-slate-500 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
              <p className="text-sm font-medium animate-pulse">Drafting your blueprint...</p>
            </div>
          ) : imageUrl ? (
            <div className="w-full space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-md bg-white">
                <img 
                  src={imageUrl} 
                  alt="Generated Floor Plan" 
                  className="h-full w-full object-contain"
                />
              </div>
              <Button variant="outline" className="w-full" onClick={() => window.open(imageUrl, '_blank')}>
                View Full Size
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-400 space-y-4 text-center">
              <PenTool className="h-16 w-16 opacity-50" />
              <div>
                <p className="font-medium text-slate-600">Your floor plan will appear here</p>
                <p className="text-sm mt-1">Fill out the form and click generate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
