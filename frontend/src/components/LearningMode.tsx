import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { CheckCircle, RefreshCcw, Activity, Target } from 'lucide-react';

export const LearningMode: React.FC<{ highContrast: boolean }> = ({ highContrast }) => {
  const isHC = highContrast;
  const [currentWord, setCurrentWord] = useState("Hello");
  const [success, setSuccess] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold mb-2">Practice Module</h1>
        <p className="opacity-80">Test your sign accuracy. Our model will verify your gestures.</p>
      </div>

      <div className={`w-full p-6 md:p-8 rounded-3xl border text-center shadow-lg mb-8
        ${isHC ? 'bg-gray-900 border-yellow-500' : 'bg-white border-emerald-100'}`}>
        
        <div className="flex items-center justify-center gap-2 mb-2 opacity-60">
          <Target className="w-4 h-4" />
          <h2 className="text-sm font-bold uppercase tracking-widest">Target Sign</h2>
        </div>
        <p className="text-4xl md:text-5xl font-black mb-8">"{currentWord}"</p>
        
        <div className={`relative aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border-4 shadow-inner bg-black
          ${success ? 'border-green-500' : (isHC ? 'border-yellow-700' : 'border-emerald-200')}`}>
          
          <Webcam
            ref={webcamRef}
            muted
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            videoConstraints={{ facingMode: "user" }}
          />
          
          <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold z-20
            ${isHC ? 'bg-gray-900 text-yellow-400' : 'bg-white/90 text-emerald-900'}`}>
            <Activity className={`w-4 h-4 animate-pulse ${isHC ? 'text-yellow-500' : 'text-emerald-500'}`} />
            Camera Active
          </div>

          {/* Success Overlay Triggered by Dev Button */}
          {success && (
            <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex flex-col items-center justify-center text-green-700 z-30 transition-all duration-300">
              <div className="bg-white p-4 rounded-full shadow-2xl mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <span className="font-black text-3xl bg-white px-6 py-2 rounded-2xl shadow-xl">Perfect!</span>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={() => setSuccess(!success)} 
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md transition-transform active:scale-95
          ${isHC ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
      >
        <RefreshCcw className={`w-5 h-5 ${success ? 'animate-spin' : ''}`} /> 
        {success ? 'Reset Practice' : 'Mock Verification (Dev)'}
      </button>
    </div>
  );
};