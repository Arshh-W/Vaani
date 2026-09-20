import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-emerald-100/60 bg-white/40 py-6 mt-12 text-center text-xs font-medium text-emerald-700/80">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Vaani — Real-time Sign Translation Platform</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            MediaPipe Hand Tracking Active
          </span>
        </div>
      </div>
    </footer>
  );
};