import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
}

export const Confetti: React.FC<{ trigger: boolean | number; onComplete?: () => void }> = ({ trigger, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#f87171'];
    const particles: Particle[] = [];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: width / 2,
        y: height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        life: 0,
        maxLife: Math.random() * 40 + 60
      });
    }

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let activeCount = 0;

      particles.forEach((p) => {
        if (p.life < p.maxLife) {
          activeCount++;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35; // gravity
          p.rotation += p.vRot;
          p.life++;

          const opacity = 1 - p.life / p.maxLife;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (activeCount > 0) {
        animationId = requestAnimationFrame(render);
      } else {
        if (onComplete) onComplete();
      }
    };

    render();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
};
