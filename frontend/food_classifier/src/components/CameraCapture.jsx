import { useEffect, useRef } from "react";
import { X, Camera } from "lucide-react";
import "./CameraCapture.css";

export default function CameraCapture({ open, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    async function init() {
      if (!open) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera error", err);
        onClose?.();
      }
    }
    init();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture?.(file);
        onClose?.();
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="cam-overlay" role="dialog" aria-modal="true">
      <div className="cam-modal">
        <div className="cam-header">
          <button className="cam-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="cam-body">
          <video ref={videoRef} playsInline muted className="cam-video" />
        </div>
        <div className="cam-actions">
          <button className="cam-shutter" onClick={handleCapture}>
            <Camera size={18} /> Capture
          </button>
        </div>
      </div>
    </div>
  );
}
