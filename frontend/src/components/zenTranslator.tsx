import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Activity, MessageSquare, Video } from 'lucide-react';

declare const Hands: any;

interface ZenProps {
  apiEndpoint: string;
  confidenceThreshold: number;
  highContrast: boolean;
}

export const ZenTranslator: React.FC<ZenProps> = ({ apiEndpoint, confidenceThreshold, highContrast }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [translation, setTranslation] = useState<string>("Waiting for hand gestures...");
  const [confidence, setConfidence] = useState<number>(0);
  const [isVirtualCamActive, setIsVirtualCamActive] = useState(false);
  
  const isHC = highContrast;
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: confidenceThreshold,
      minTrackingConfidence: confidenceThreshold,
    });

    hands.onResults(onResults);

    let animationFrameId: number;

    const processVideoFrame = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
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
  }, [confidenceThreshold]);

  const onResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // Access HAND_CONNECTIONS from the window object loaded via CDN script in index.html
      const connections = (window as any).HAND_CONNECTIONS;

      // Draw Skeleton Connections
      if (connections) {
        for (const connection of connections) {
          const from = landmarks[connection[0]];
          const to = landmarks[connection[1]];
          ctx.beginPath();
          ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
          ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
          ctx.strokeStyle = isHC ? '#facc15' : '#34d399'; 
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }

      // Draw Landmark Joints
      for (const lm of landmarks) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = isHC ? '#ca8a04' : '#059669'; 
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
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landmarks }),
      });
      const data = await response.json();
      setTranslation(data.gesture || "Translating...");
      setConfidence(data.confidence || 0);
    } catch (err) {
      // Quietly handle connection errors if backend isn't up yet
    }
  };

  const quickPhrases = [
    "I need a doctor.", "Where is the bus stop?", "Thank you.", "Please wait."
  ];

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
      
      {/* Left Column: Camera & Virtual Cam Controls */}
      <section className="lg:col-span-7 flex flex-col gap-4">
        <div className={`relative aspect-video rounded-3xl overflow-hidden shadow-lg border-4 flex items-center justify-center
          ${isHC ? 'bg-gray-900 border-yellow-500' : 'bg-emerald-950/10 border-white/80'}`}>
          <Webcam
            ref={webcamRef}
            muted
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 rounded-2xl"
          />
          <canvas
            ref={canvasRef}
            width={640} height={480}
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none z-10"
          />
          <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold z-20
            ${isHC ? 'bg-gray-900 text-yellow-400' : 'bg-white/90 text-emerald-900'}`}>
            <Activity className={`w-4 h-4 animate-pulse ${isHC ? 'text-yellow-500' : 'text-emerald-500'}`} />
            Live Tracking
          </div>
        </div>

        {/* Video Call Integration Panel */}
        <div className={`p-4 rounded-2xl flex items-center justify-between border ${isHC ? 'bg-gray-900 border-yellow-900' : 'bg-white/60 border-emerald-200'}`}>
          <div className="flex items-center gap-3">
            <Video className={`w-6 h-6 ${isHC ? 'text-yellow-400' : 'text-emerald-600'}`} />
            <div>
              <h3 className="font-bold text-sm">Virtual Camera (Meet/Zoom)</h3>
              <p className="text-xs opacity-70">Broadcast translations as subtitles in your video calls.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsVirtualCamActive(!isVirtualCamActive)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isVirtualCamActive 
                ? 'bg-red-500 text-white' 
                : (isHC ? 'bg-yellow-500 text-gray-900' : 'bg-emerald-600 text-white')
            }`}
          >
            {isVirtualCamActive ? 'Stop Output' : 'Start Virtual Cam'}
          </button>
        </div>
      </section>

      {/* Right Column: Output & Custom Phrases */}
      <section className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Real-time Output Card */}
        <div className={`flex flex-col justify-center p-8 rounded-3xl border shadow-lg h-64
          ${isHC ? 'bg-gray-900 border-yellow-500' : 'bg-white/80 border-emerald-100'}`}>
          <h2 className="text-xs uppercase tracking-widest font-bold mb-4 opacity-70">Translation</h2>
          <p className="text-3xl md:text-4xl font-semibold text-center leading-tight mb-auto">
            {translation}
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
            <div className={`h-full transition-all duration-300 ${isHC ? 'bg-yellow-400' : 'bg-emerald-500'}`} style={{ width: `${confidence * 100}%` }} />
          </div>
        </div>

        {/* Custom Quick Phrases */}
        <div className={`p-6 rounded-3xl border shadow-sm ${isHC ? 'bg-gray-900 border-yellow-800' : 'bg-white/60 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 opacity-70" />
            <h3 className="font-bold text-sm">Custom Quick Phrases</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickPhrases.map((phrase, idx) => (
              <button 
                key={idx}
                onClick={() => setTranslation(phrase)}
                className={`p-3 text-left rounded-xl text-sm font-medium transition-colors border
                  ${isHC ? 'bg-gray-800 border-yellow-900 hover:border-yellow-400' : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}
              >
                {phrase}
              </button>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border-2 border-dashed rounded-xl text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">
            + Add New Phrase
          </button>
        </div>
      </section>
    </div>
  );
};