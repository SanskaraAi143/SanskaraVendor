import React, { useRef, useEffect } from 'react';

export const WaveformVisualizer: React.FC<{
  analyserNode: AnalyserNode | null;
  currentUtterance: { user: string; agent: string };
}> = ({ analyserNode, currentUtterance }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    };

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(canvas);
    resizeCanvas();

    const draw = (time: number) => {
      animationFrameId.current = requestAnimationFrame(draw);
      const width = canvas.width;
      const height = canvas.height;
      canvasCtx.clearRect(0, 0, width, height);

      const centerY = height / 2;

      if (!analyserNode) {
        // Idle animation
        canvasCtx.lineWidth = 2.5 * window.devicePixelRatio;
        canvasCtx.strokeStyle = 'rgba(129, 140, 248, 0.7)';
        canvasCtx.beginPath();
        const waveTime = time * 0.001;
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * 0.03 + waveTime) * (height * 0.05);
          canvasCtx.lineTo(x, y);
        }
        canvasCtx.stroke();
        return;
      }

      // Active animation
      analyserNode.fftSize = 2048;
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteTimeDomainData(dataArray);

      canvasCtx.lineWidth = 3 * window.devicePixelRatio;
      canvasCtx.strokeStyle = '#6366F1';
      canvasCtx.beginPath();

      const sliceWidth = width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // value between 0 and 2
        const y = (v - 1) * (height * 0.4) + centerY; // center it and scale amplitude
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasCtx.stroke();
    };

    draw(0);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      observer.disconnect();
    };
  }, [analyserNode]);

  return (
    <div className="relative w-full h-32"> {/* Adjusted height for waveform */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
        <div className="text-center">
          <p className="text-lg h-6 text-gray-300 transition-opacity duration-300 truncate max-w-full">{currentUtterance.user}</p>
          <p className="text-xl h-7 font-semibold text-white transition-opacity duration-300 truncate max-w-full">{currentUtterance.agent}</p>
        </div>
      </div>
    </div>
  );
};
