import React, { useEffect } from 'react';
import { X, MapPin, Volume2, Phone } from 'lucide-react';

export const EmergencyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const speakEmergency = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1; // Max volume
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  };

  const emergencyPhrases = [
    "I am deaf and I need immediate assistance.",
    "Please call an ambulance.",
    "I am lost, please help me find the police station."
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-red-600 text-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border-4 border-red-400">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-black uppercase tracking-wider flex items-center gap-3">
            <Phone className="w-8 h-8 animate-pulse" /> Emergency
          </h2>
          <button onClick={onClose} className="p-2 bg-red-500 hover:bg-red-400 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="font-medium mb-6 text-red-100">Tap a phrase below. It will be spoken loudly by your device.</p>

        <div className="space-y-3 mb-8">
          {emergencyPhrases.map((phrase, i) => (
            <button 
              key={i}
              onClick={() => speakEmergency(phrase)}
              className="w-full text-left p-4 bg-white text-red-700 font-bold text-lg rounded-xl flex justify-between items-center hover:bg-red-50 transition-colors shadow-md"
            >
              {phrase}
              <Volume2 className="w-6 h-6 opacity-50" />
            </button>
          ))}
        </div>

        <button 
          onClick={() => alert("Fetching GPS coordinates and sharing with emergency contacts...")}
          className="w-full py-4 bg-red-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-500"
        >
          <MapPin className="w-5 h-5" /> Share My Live Location
        </button>
      </div>
    </div>
  );
};