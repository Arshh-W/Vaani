import React, { useState } from 'react';
import { ZenTranslator } from './components/zenTranslator';
import { HowToUse } from './components/HowToUse';
import { SettingsModal } from './components/SettingsModal';
import { LearningMode } from './components/LearningMode';
import { Community } from './components/Community';
import { EmergencyModal } from './components/EmergencyModal';
import { GestureDictionary } from './components/GestureDictionary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

export type ViewState = 'translator' | 'how-to-use' | 'learn' | 'community' | 'dictionary';

export function App() {
  const [currentView, setCurrentView] = useState<ViewState>('translator');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  // Default to the FastAPI image/frame prediction endpoint
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000/predict/image');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);

  const themeClasses = highContrast 
    ? "bg-gray-950 text-yellow-400" 
    : "bg-emerald-50/60 text-emerald-950";
  
  const textClasses = largeText ? "text-lg" : "text-base";

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themeClasses} ${textClasses}`}>
      <Navbar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        largeText={largeText}
        setLargeText={setLargeText}
      />

      <div className="flex-grow pt-24 pb-8 px-4">
        {currentView === 'translator' && (
          <ZenTranslator 
            apiEndpoint={apiEndpoint} 
            confidenceThreshold={confidenceThreshold} 
            highContrast={highContrast} 
          />
        )}
        {currentView === 'how-to-use' && <HowToUse onBack={() => setCurrentView('translator')} />}
        {currentView === 'learn' && <LearningMode highContrast={highContrast} />}
        {currentView === 'community' && <Community highContrast={highContrast} />}
        {currentView === 'dictionary' && <GestureDictionary highContrast={highContrast} />}
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiEndpoint={apiEndpoint}
        setApiEndpoint={setApiEndpoint}
        confidenceThreshold={confidenceThreshold}
        setConfidenceThreshold={setConfidenceThreshold}
      />

      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />
      <Footer />
    </div>
  );
}

export default App;