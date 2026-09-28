"use client";
import { useEffect, useRef } from "react";

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    let animationFrameId;
    let particles = [];
    
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      windowHalfX = canvas.width / 2;
      windowHalfY = canvas.height / 2;
      initParticles();
    };

    window.addEventListener("resize", resizeCanvas);
    
    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX - windowHalfX) * 0.05;
      mouse.targetY = (e.clientY - windowHalfY) * 0.05;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Colores sutiles y amigables inspirados en Minecraft (diamante, amatista, exp)
    const colors = [
      "rgba(0, 191, 255, 0.4)",  // Celeste (Diamante)
      "rgba(168, 85, 247, 0.4)", // Morado (Amatista)
      "rgba(16, 185, 129, 0.4)", // Verde (Esmeralda/Exp)
      "rgba(255, 255, 255, 0.2)" // Blanco sutil
    ];

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // Distribuir en toda la pantalla inicial
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20; // Nacer justo abajo
        this.size = Math.random() * 3 + 1; // Más pequeños y elegantes
        this.speedY = Math.random() * 0.5 + 0.1; // Subida muy suave
        this.speedX = (Math.random() - 0.5) * 0.3; // Desvío suave
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update(parallaxX, parallaxY) {
        this.y -= this.speedY;
        this.x += this.speedX;

        // Si sale por arriba, reiniciar abajo
        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset();
        }

        // Aplicar Parallax sutil
        const drawX = this.x + parallaxX * (this.size * 0.5);
        const drawY = this.y + parallaxY * (this.size * 0.5);

        // Dibujar partícula con resplandor (Glow)
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        // Efecto de brillo
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        ctx.shadowBlur = 0; // Resetear sombra para no afectar otras
      }
    }

    const initParticles = () => {
      particles = [];
      // Menos partículas para que sea amigable y no sature la vista ni el CPU
      const numParticles = Math.floor((canvas.width * canvas.height) / 25000);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      // Limpiar el canvas para que los fondos CSS se vean a través
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Suavizado del movimiento del ratón
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouse.x, mouse.y);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, // Se coloca justo encima del fondo del body pero debajo del contenido
        pointerEvents: 'none'
      }}
    />
  );
}
