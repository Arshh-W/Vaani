import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Hands, HAND_CONNECTIONS, type Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { Volume2, VolumeX, Sparkles, Activity } from 'lucide-react';

export const ZenTranslator: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [translation, setTranslation] = useState<string>("Waiting for hand gestures...");
  const [confidence, setConfidence] = useState<number>(0);
  const [audioMuted, setAudioMuted] = useState<boolean>(true);

  // Throttle backend requests to prevent overload
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    hands.onResults(onResults);

    if (webcamRef.current && webcamRef.current.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current?.video) {
            await hands.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  const onResults = (results: Results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      // Draw connections
      for (const connection of HAND_CONNECTIONS) {
        const from = landmarks[connection[0]];
        const to = landmarks[connection[1]];
        ctx.beginPath();
        ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
        ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw landmark joints
      for (const lm of landmarks) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#f43f5e';
        ctx.fill();
      }

      // Post keypoints to backend max 5 times per second
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
      console.error("Inference Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Zen Ambient Background Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8 z-10 backdrop-blur-md bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-medium tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            KineVox <span className="text-xs text-slate-400 font-normal">Zen Edition</span>
          </h1>
        </div>
        <button 
          onClick={() => setAudioMuted(!audioMuted)}
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 transition border border-slate-700 text-slate-300"
        >
          {audioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
        </button>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
        {/* Webcam Viewport */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
          <Webcam
            ref={webcamRef}
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Edge Tracking Active</span>
          </div>
        </div>

        {/* Translation Output Box */}
        <div className="flex flex-col justify-between bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/80 shadow-2xl">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Live Translation</span>
            <div className="mt-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/50">
              <p className="text-3xl font-light tracking-wide text-cyan-200 transition-all duration-300">
                "{translation}"
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Confidence Score</span>
              <span>{(confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};