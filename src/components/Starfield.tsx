
import { useEffect, useRef } from 'react';

export const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Enhanced star particles
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      color: string;
      twinkleSpeed: number;
    }> = [];

    // Create more varied stars
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 0.5,
        speed: Math.random() * 0.8 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
        color: Math.random() > 0.6 ? '#00ffff' : Math.random() > 0.8 ? '#8b5cf6' : '#ffffff',
        twinkleSpeed: Math.random() * 0.03 + 0.01
      });
    }

    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Enhanced background with subtle gradient animation
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `rgba(2, 6, 23, ${0.1 + Math.sin(time) * 0.02})`);
      gradient.addColorStop(0.5, `rgba(15, 23, 42, ${0.1 + Math.cos(time * 0.7) * 0.02})`);
      gradient.addColorStop(1, `rgba(30, 27, 75, ${0.1 + Math.sin(time * 0.5) * 0.02})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star, index) => {
        ctx.save();
        
        // Enhanced twinkle effect
        const twinkle = Math.sin(time * 10 + index) * 0.3 + 0.7;
        ctx.globalAlpha = star.opacity * twinkle;
        ctx.fillStyle = star.color;
        ctx.shadowBlur = star.size * 3;
        ctx.shadowColor = star.color;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
        ctx.fill();
        
        // Add subtle cross glow effect for larger stars
        if (star.size > 2) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = star.opacity * twinkle * 0.5;
          
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 2, star.y);
          ctx.lineTo(star.x + star.size * 2, star.y);
          ctx.moveTo(star.x, star.y - star.size * 2);
          ctx.lineTo(star.x, star.y + star.size * 2);
          ctx.stroke();
        }
        
        ctx.restore();

        // Move star with slight horizontal drift
        star.y += star.speed;
        star.x += Math.sin(time + index) * 0.1;
        
        if (star.y > canvas.height) {
          star.y = -star.size;
          star.x = Math.random() * canvas.width;
        }

        // Enhanced twinkle effect
        star.opacity += (Math.random() - 0.5) * star.twinkleSpeed;
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ 
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 100%)',
        zIndex: -1
      }}
    />
  );
};
