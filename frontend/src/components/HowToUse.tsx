import React from 'react';
import { Camera, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';

export const HowToUse: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const steps = [
    {
      icon: <Camera className="w-6 h-6 text-emerald-600" />,
      title: "1. Position Your Camera",
      description: "Ensure your webcam has a clear view of your face and hands. Position yourself in a well-lit area without strong light directly behind you."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-600" />,
      title: "2. Perform Sign Gestures",
      description: "Hold your hand inside the frame. The green tracking skeleton will align with your key hand joints in real time."
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      title: "3. Read Real-Time Predictions",
      description: "The model runs inferences on normalized coordinates and projects translated text onto the main display card along with a confidence metric."
    }
  ];

  return (
    <div className="min-h-screen bg-emerald-50/60 text-emerald-950 p-6 md:p-12 font-sans flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <button 
          onClick={onBack}
          className="mb-6 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-2"
        >
          ← Back to Translator
        </button>

        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-emerald-900 mb-2">How to Use Vaani</h1>
          <p className="text-emerald-700">Real-time sign gesture translation made seamless and accessible.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-start">
              <div className="p-3 bg-emerald-100/80 rounded-xl mb-4">{step.icon}</div>
              <h3 className="font-bold text-lg text-emerald-900 mb-2">{step.title}</h3>
              <p className="text-sm text-emerald-800 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-emerald-100/60 border border-emerald-200/80 rounded-2xl p-6 flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 text-emerald-700 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-emerald-950 text-base mb-1">Privacy & Processing Notice</h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Video streams are never saved or sent to external servers. MediaPipe extracts 21 three-dimensional landmark coordinates locally inside your web browser using WebAssembly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};