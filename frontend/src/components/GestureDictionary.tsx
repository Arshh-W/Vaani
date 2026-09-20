import React from 'react';
import { Book } from 'lucide-react';

export const GestureDictionary: React.FC<{ highContrast: boolean }> = ({ highContrast }) => {
  const isHC = highContrast;
  
  // Dynamic placeholders. Replace these URLs with local paths (e.g., '/assets/hello.gif') when ready.
  const signs = [
    { word: "Hello", description: "Wave hand side to side", imageUrl: "https://placehold.co/400x400/059669/ffffff?text=Hello\nSign" },
    { word: "Thank You", description: "Fingers to chin, move hand forward", imageUrl: "https://placehold.co/400x400/059669/ffffff?text=Thank\nYou" },
    { word: "I Love You", description: "Thumb, index, and pinky extended", imageUrl: "https://placehold.co/400x400/059669/ffffff?text=I+Love\nYou" },
    { word: "Yes", description: "Fist knocking up and down", imageUrl: "https://placehold.co/400x400/059669/ffffff?text=Yes\nSign" },
    { word: "No", description: "Index and middle finger tap thumb", imageUrl: "https://placehold.co/400x400/059669/ffffff?text=No\nSign" },
    { word: "Please", description: "Flat hand rubbing chest in a circular motion", imageUrl: "https://placehold.co/400x400/059669/ffffff?text=Please\nSign" },
    { word: "Sorry", description: "Fist rubbing chest in a circular motion", imageUrl: "https://placehold.co/400x400/059669/ffffff?text=Sorry\nSign" },
    { word: "Help", description: "Closed fist resting on flat palm moving up", imageUrl: "https://placehold.co/400x400/059669/ffffff?text=Help\nSign" }
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col items-center">
      <div className={`w-full p-8 rounded-3xl border shadow-lg ${isHC ? 'bg-gray-900 border-yellow-500' : 'bg-white border-emerald-100'}`}>
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className={`p-4 rounded-full mb-4 ${isHC ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-100 text-emerald-600'}`}>
            <Book className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Gesture Dictionary</h1>
          <p className="opacity-80 max-w-lg">Learn standard sign language gestures. Study the motions below before heading into the Practice module to test your accuracy.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {signs.map((sign, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-transform hover:-translate-y-1 shadow-sm
              ${isHC ? 'bg-gray-800 border-yellow-900 hover:border-yellow-500' : 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300'}`}>
              
              <div className={`w-32 h-32 rounded-xl flex items-center justify-center mb-4 overflow-hidden border-2 shadow-inner
                ${isHC ? 'border-gray-700' : 'border-emerald-200'}`}>
                 <img 
                   src={sign.imageUrl} 
                   alt={`Sign language gesture for ${sign.word}`}
                   className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                 />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{sign.word}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{sign.description}</p>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};