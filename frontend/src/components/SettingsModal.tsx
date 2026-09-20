import React, { useState } from 'react';
import { X, Sliders, Server, Eye } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  apiEndpoint: string;
  setApiEndpoint: (url: string) => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  apiEndpoint,
  setApiEndpoint,
  confidenceThreshold,
  setConfidenceThreshold,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-emerald-100 mb-6">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-lg">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <span>Preferences</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-emerald-50 text-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Backend Endpoint URL */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-800 mb-2">
              <Server className="w-4 h-4 text-emerald-600" />
              Inference API Server Endpoint
            </label>
            <input 
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-emerald-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Confidence Threshold */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-800">
                <Eye className="w-4 h-4 text-emerald-600" />
                Detection Confidence Threshold
              </label>
              <span className="text-xs font-bold text-emerald-700">{(confidenceThreshold * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range"
              min="0.3"
              max="0.9"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-md"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
};