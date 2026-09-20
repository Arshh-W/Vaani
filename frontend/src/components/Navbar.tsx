import React from 'react';
import { Leaf, AlertTriangle, MonitorPlay, Type, Contrast, BookOpen, Users, Home, BookMarked } from 'lucide-react';
import type { ViewState } from '../App';

interface NavbarProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  onOpenSettings: () => void;
  onOpenEmergency: () => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView, setCurrentView, onOpenSettings, onOpenEmergency, 
  highContrast, setHighContrast, largeText, setLargeText
}) => {
  const isHC = highContrast; // Shorthand for styling

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 px-6 py-3 border-b backdrop-blur-xl flex items-center justify-between shadow-sm transition-all
      ${isHC ? 'bg-gray-950/90 border-yellow-500' : 'bg-white/80 border-emerald-100'}`}
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('translator')}>
        <div className={`p-2 rounded-xl ${isHC ? 'bg-yellow-500 text-gray-900' : 'bg-emerald-100/80 text-emerald-600'}`}>
          <Leaf className="w-6 h-6" />
        </div>
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isHC ? 'text-yellow-400' : 'text-emerald-900'}`}>Vaani</h1>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 font-semibold">

      <NavBtn active={currentView === 'translator'} onClick={() => setCurrentView('translator')} icon={<Home className="w-4 h-4"/>} text="Translate" isHC={isHC} />
<NavBtn active={currentView === 'dictionary'} onClick={() => setCurrentView('dictionary')} icon={<BookMarked className="w-4 h-4"/>} text="Dictionary" isHC={isHC} />
<NavBtn active={currentView === 'learn'} onClick={() => setCurrentView('learn')} icon={<BookOpen className="w-4 h-4"/>} text="Practice" isHC={isHC} />
<NavBtn active={currentView === 'community'} onClick={() => setCurrentView('community')} icon={<Users className="w-4 h-4"/>} text="Contribute" isHC={isHC} />
      </div>

      <div className="flex items-center gap-3">
        {/* Accessibility Toggles */}
        <button onClick={() => setLargeText(!largeText)} className={`p-2 rounded-full ${isHC ? 'hover:bg-gray-800' : 'hover:bg-emerald-50'}`} title="Toggle Text Size">
          <Type className={`w-5 h-5 ${isHC ? 'text-yellow-400' : 'text-emerald-700'}`} />
        </button>
        <button onClick={() => setHighContrast(!highContrast)} className={`p-2 rounded-full ${isHC ? 'hover:bg-gray-800' : 'hover:bg-emerald-50'}`} title="High Contrast Mode">
          <Contrast className={`w-5 h-5 ${isHC ? 'text-yellow-400' : 'text-emerald-700'}`} />
        </button>

        {/* Emergency Mode Button */}
        <button 
          onClick={onOpenEmergency}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full shadow-lg transition-transform hover:scale-105 animate-pulse"
        >
          <AlertTriangle className="w-4 h-4" /> SOS
        </button>
      </div>
    </nav>
  );
};

const NavBtn = ({ active, onClick, icon, text, isHC }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 transition-colors ${
      active 
        ? (isHC ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-emerald-700 border-b-2 border-emerald-500') 
        : (isHC ? 'text-gray-400 hover:text-yellow-200' : 'text-emerald-950/60 hover:text-emerald-700')
    }`}
  >
    {icon} {text}
  </button>
);