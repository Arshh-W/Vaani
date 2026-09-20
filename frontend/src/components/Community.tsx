import React from 'react';
import { UploadCloud, Shield } from 'lucide-react';

export const Community: React.FC<{ highContrast: boolean }> = ({ highContrast }) => {
  const isHC = highContrast;

  return (
    <div className="max-w-3xl mx-auto">
      <div className={`p-8 rounded-3xl border shadow-lg ${isHC ? 'bg-gray-900 border-yellow-500' : 'bg-white border-emerald-100'}`}>
        <h1 className="text-2xl font-bold mb-2">Contribute to the Dataset</h1>
        <p className="opacity-80 mb-8">Help us expand our Indian Sign Language vocabulary by submitting new signs. All data is anonymized.</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Sign Name (English/Hindi Translation)</label>
            <input type="text" placeholder="e.g., 'Water' or 'Paani'" className={`w-full p-3 rounded-xl border ${isHC ? 'bg-gray-800 border-yellow-900 text-yellow-400' : 'bg-emerald-50 border-emerald-200'}`} />
          </div>

          <div className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors
            ${isHC ? 'border-yellow-700 hover:bg-gray-800' : 'border-emerald-300 hover:bg-emerald-50'}`}>
            <UploadCloud className="w-10 h-10 mb-3 opacity-60" />
            <span className="font-bold">Record or Upload Video</span>
            <span className="text-xs opacity-60 mt-1">Max 5 seconds. Clear lighting required.</span>
          </div>

          <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 leading-relaxed">
              By submitting, you consent to this video being used for model training under open-source licenses. Faces are automatically blurred on our servers before storage.
            </p>
          </div>

          <button className={`w-full py-3 rounded-xl font-bold shadow-md ${isHC ? 'bg-yellow-500 text-gray-900' : 'bg-emerald-600 text-white'}`}>
            Submit Sign
          </button>
        </div>
      </div>
    </div>
  );
};