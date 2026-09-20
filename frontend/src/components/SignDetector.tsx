import React, { useRef, useEffect, useState } from "react";

export default function SignDetector(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [currentSign, setCurrentSign] = useState<string>("Waiting for sign...");
  const [accumulatedWord, setAccumulatedWord] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // References for stabilization logic (prevents spamming the same letter)
  const lastPredictedRef = useRef<string>("");
  const stableCountRef = useRef<number>(0);

  // 1. Start Webcam Stream on Mount
  useEffect(() => {
    async function setupCamera(): Promise<void> {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCurrentSign("Camera ready. Click start to detect!");
      } catch (err) {
        console.error("Webcam access error:", err);
        setCurrentSign("Error: Could not access webcam.");
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. Continuous Frame Capture Loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isCapturing) {
      intervalId = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas frame to a JPEG blob and send to backend
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            const response = await fetch("http://127.0.0.1:8000/predict/image", {
              method: "POST",
              body: blob,
              headers: { "Content-Type": "image/jpeg" },
            });
            
            if (!response.ok) return;
            
            const data = await response.json();
            const text = data.prediction || data.result || data.text || data.label || data.sign;
            
            if (text) {
              setCurrentSign(text);

              // Smart Stabilization: Require the same sign for 3 consecutive checks 
              // before appending it to the word string so it doesn't flood letters.
              if (text === lastPredictedRef.current) {
                stableCountRef.current += 1;
                if (stableCountRef.current === 3) {
                  setAccumulatedWord((prev) => prev + text);
                }
              } else {
                lastPredictedRef.current = text;
                stableCountRef.current = 1;
              }
            } else {
              setCurrentSign("No hand detected");
            }
          } catch (err) {
            console.error("Prediction fetch error:", err);
          }
        }, "image/jpeg", 0.7);

      }, 400); 
    }

    return () => clearInterval(intervalId);
  }, [isCapturing]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Vaani Live Sign Language Translation</h2>
      
      {/* Video Feed */}
      <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ width: "640px", height: "480px", transform: "scaleX(-1)" }} 
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* Live Sign Banner */}
      <div style={{ fontSize: "20px", fontWeight: "bold", padding: "10px 20px", background: "#f0f2f5", borderRadius: "8px", minWidth: "300px", textAlign: "center" }}>
        Current Sign: <span style={{ color: "#2563eb" }}>{currentSign}</span>
      </div>

      {/* Accumulated Word/Sentence Output Box */}
      <div style={{ width: "640px", background: "#ffffff", border: "2px solid #e5e7eb", borderRadius: "10px", padding: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "5px", fontWeight: "600" }}>TRANSLATED SENTENCE:</div>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", minHeight: "35px", wordBreak: "break-all" }}>
          {accumulatedWord || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Start signing to build words...</span>}
        </div>
        
        {/* Action Controls for the Word */}
        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <button 
            onClick={() => setAccumulatedWord((prev) => prev + " ")}
            style={{ padding: "6px 12px", background: "#4b5563", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Add Space
          </button>
          <button 
            onClick={() => setAccumulatedWord((prev) => prev.slice(0, -1))}
            style={{ padding: "6px 12px", background: "#d97706", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Backspace
          </button>
          <button 
            onClick={() => setAccumulatedWord("")}
            style={{ padding: "6px 12px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginLeft: "auto" }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Start / Stop Toggle */}
      <button 
        onClick={() => setIsCapturing(!isCapturing)}
        style={{
          padding: "12px 28px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: isCapturing ? "#dc2626" : "#16a34a",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
        }}
      >
        {isCapturing ? "Stop Detection" : "Start Detection"}
      </button>
    </div>
  );
}