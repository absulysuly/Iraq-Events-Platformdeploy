import React, { useState, useEffect } from 'react';
import type { City, Category, AIAutofillData, AISuggestionResponse } from '../types';
import { generateEventDetailsFromPrompt } from '../services/geminiService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: AIAutofillData) => void;
  cities: City[];
  categories: Category[];
}

// FIX: Changed from named to default export to fix lazy loading issue.
const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, onApply, cities, categories }) => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
        setPrompt('');
        setSuggestions(null);
        setError(null);
        setIsLoading(false);
    }
  }, [isOpen]);

  const handleGetSuggestions = async () => {
    if (!prompt) {
      setError('Please describe your event idea.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await generateEventDetailsFromPrompt(prompt, cities, categories);
      setSuggestions(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApply = () => {
    if (!suggestions) return;
    onApply({
        title: suggestions.title,
        description: suggestions.description,
        categoryId: suggestions.suggestedCategoryId,
        cityId: suggestions.suggestedCityId,
        imageBase64: suggestions.generatedImageBase64,
    });
    onClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  }

  if (!isOpen) return null;

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-600";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
      <div className="bg-gray-800 text-gray-200 rounded-lg shadow-xl w-full max-w-2xl p-6 my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 id="ai-modal-title" className="text-2xl font-bold text-gray-100">AI Event Assistant</h2>
          <button onClick={handleClose} disabled={isLoading} className="text-gray-500 hover:text-gray-300 disabled:opacity-50 text-2xl leading-none">&times;</button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label htmlFor="event-prompt" className="block text-sm font-medium text-gray-400">Describe your event idea</label>
                <textarea id="event-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className={inputClasses}
                    placeholder="e.g., A traditional music concert in Sulaymaniyah for next month" disabled={!!suggestions || isLoading} />
            </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        
        {isLoading && (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
                <p className="mt-4 text-gray-400">AI is working its magic...</p>
                <p className="text-sm text-gray-500">This may take a moment.</p>
            </div>
        )}

        {suggestions && (
            <div className="mt-6 border-t border-gray-700 pt-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">✨ AI Suggestions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="font-medium text-gray-400">Generated Title:</p>
                        <p className="text-indigo-400 font-semibold">{suggestions.title.en}</p>
                        
                        <p className="font-medium text-gray-400 mt-4">Suggested Category:</p>
                        <p className="text-indigo-400 font-semibold">{categories.find(c => c.id === suggestions.suggestedCategoryId)?.name.en || 'Unknown'}</p>
                        
                        <p className="font-medium text-gray-400 mt-4">Suggested City:</p>
                        <p className="text-indigo-400 font-semibold">{cities.find(c => c.id === suggestions.suggestedCityId)?.name.en || 'Unknown'}</p>
                    </div>
                    <div>
                         <p className="font-medium text-gray-400 mb-2">Generated Image Preview:</p>
                         <img 
                            src={`data:image/png;base64,${suggestions.generatedImageBase64}`} 
                            alt="AI generated event" 
                            className="rounded-lg shadow-md w-full h-auto object-cover"
                         />
                    </div>
                </div>
            </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={handleClose} disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 disabled:opacity-50">
            Cancel
          </button>
          
          {!suggestions ? (
            <button onClick={handleGetSuggestions} disabled={isLoading || !prompt}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center w-48">
              {isLoading ? 'Thinking...' : 'Get AI Suggestions'}
            </button>
          ) : (
            <button onClick={handleApply}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Use These Suggestions
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;
