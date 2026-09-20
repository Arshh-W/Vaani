import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Volume2, VolumeX, Leaf, Activity, HelpCircle, Home, Settings } from 'lucide-react';

declare const Hands: any;
declare const HAND_CONNECTIONS: any;

export const ZenTranslator: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [translation, setTranslation] = useState<string>("Waiting for hand gestures...");
  const [confidence, setConfidence] = useState<number>(0);
  const [audioMuted, setAudioMuted] = useState<boolean>(true);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    if (audioRef.current) {
      if (audioMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [audioMuted]);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    hands.onResults(onResults);

    let animationFrameId: number;

    const processVideoFrame = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        setIsCameraActive(true);
        await hands.send({ image: webcamRef.current.video });
      }
      animationFrameId = requestAnimationFrame(processVideoFrame);
    };

    processVideoFrame();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      hands.close();
    };
  }, []);

  const onResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      // Draw Serene Green Skeleton Connections
      if (typeof HAND_CONNECTIONS !== 'undefined') {
        for (const connection of HAND_CONNECTIONS) {
          const from = landmarks[connection[0]];
          const to = landmarks[connection[1]];
          ctx.beginPath();
          ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
          ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
          ctx.strokeStyle = '#34d399'; // emerald-400
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }

      // Draw Landmark Joints
      for (const lm of landmarks) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#059669'; // emerald-600
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const now = Date.now();
      if (now - lastSentRef.current > 200) {
        lastSentRef.current = now;
        sendLandmarksToBackend(landmarks);
      }
    } else {
      setTranslation("No hand detected");
      setConfidence(0);
    }
    ctx.restore();
  };

  const sendLandmarksToBackend = async (landmarks: any[]) => {
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landmarks }),
      });
      const data = await response.json();
      setTranslation(data.gesture);
      setConfidence(data.confidence);
    } catch (err) {
      // Prevent console pollution during development before backend API is online
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/60 text-emerald-950 flex flex-col items-center p-4 md:p-8 font-sans transition-colors duration-500">
      
      {/* Background Ambient Audio */}
      <audio ref={audioRef} src="/ambient.mp3" loop />

      {/* Main Navigation Header */}
      <nav className="w-full max-w-6xl flex items-center justify-between mb-8 bg-white/70 backdrop-blur-lg px-6 py-4 rounded-2xl border border-emerald-100 shadow-sm" aria-label="Main Navigation">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100/80 rounded-xl">
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-900">Vaani</h1>
            <p className="text-xs font-medium text-emerald-600/90">Peaceful Sign Translation</p>
          </div>
        </div>

        {/* Usability & Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-emerald-800">
          <button className="flex items-center gap-2 hover:text-emerald-600 transition-colors"><Home className="w-4 h-4"/> Home</button>
          <button className="flex items-center gap-2 hover:text-emerald-600 transition-colors"><HelpCircle className="w-4 h-4"/> How to Use</button>
          <button className="flex items-center gap-2 hover:text-emerald-600 transition-colors"><Settings className="w-4 h-4"/> Settings</button>
        </div>

        <button 
          onClick={() => setAudioMuted(!audioMuted)}
          aria-label={audioMuted ? "Unmute ambient music" : "Mute ambient music"}
          className="p-3 rounded-full bg-emerald-100/50 hover:bg-emerald-100 transition-colors border border-emerald-200 text-emerald-700 shadow-sm"
        >
          {audioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
        </button>
      </nav>

      {/* Primary Dashboard Layout */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        
        {/* Left Section: Video Feed & Skeleton Layer */}
        <section className="lg:col-span-7 flex flex-col gap-4" aria-label="Camera Feed">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-emerald-950/10 shadow-lg border-4 border-white/80 flex items-center justify-center">
            
            {!isCameraActive && (
              <p className="absolute text-emerald-700 font-medium z-20 animate-pulse">Initializing Camera Feed...</p>
            )}

            <Webcam
              ref={webcamRef}
              muted
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 rounded-2xl"
              videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none z-10"
            />
            
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-semibold text-emerald-900 z-20">
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Live Edge Tracking</span>
            </div>
          </div>
          <p className="text-xs text-emerald-700/80 px-2 text-center lg:text-left">
            Privacy First: Video frames remain local in your browser.
          </p>
        </section>

        {/* Right Section: Real-time Output & Visual Feedback */}
        <section className="lg:col-span-5 flex flex-col justify-center bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-emerald-100 shadow-lg" aria-live="polite">
          <h2 className="text-xs uppercase tracking-widest text-emerald-600 font-bold mb-6">Real-Time Translation</h2>
          
          <div className="flex-grow flex items-center justify-center min-h-[160px] p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 mb-8 transition-all">
            <p className="text-3xl md:text-4xl font-semibold text-emerald-950 text-center leading-tight">
              {translation}
            </p>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between text-sm font-medium text-emerald-800 mb-3">
              <span>Model Confidence</span>
              <span className="font-bold text-emerald-700">{(confidence * 100).toFixed(0)}%</span>
            </div>
            
            <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden shadow-inner" role="progressbar" aria-valuenow={confidence * 100} aria-valuemin={0} aria-valuemax={100}>
              <div 
                className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};