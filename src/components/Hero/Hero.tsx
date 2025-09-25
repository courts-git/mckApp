import React, { useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Hero.css';

// Animated Soundwave Component
interface SoundwaveProps {
  color: string;
  opacity: number;
  speed: number;
  amplitude: number;
  frequency: number;
  className?: string;
}

const AnimatedSoundwave: React.FC<SoundwaveProps> = ({
  color,
  opacity,
  speed,
  amplitude,
  frequency,
  className = ""
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  
  useEffect(() => {
    if (!pathRef.current) return;
    
    let animationId: number;
    let time = 0;
    
    const animate = () => {
      time += speed;
      
      const width = 1200;
      const height = 600;
      const centerY = height / 2;
      const step = 3; // Smaller step for smoother curves
      
      // Generate points for smooth soundwave path
      const points: Array<{x: number, y: number}> = [];
      
      for (let x = 0; x <= width; x += step) {
        const progress = x / width;
        
        // Create multiple sine waves for complex soundwave pattern
        const wave1 = Math.sin((progress * frequency * Math.PI * 2) + time) * amplitude;
        const wave2 = Math.cos((progress * frequency * 1.5 * Math.PI * 2) + time * 0.7) * amplitude * 0.6;
        const wave3 = Math.sin((progress * frequency * 0.8 * Math.PI * 2) + time * 1.3) * amplitude * 0.4;
        
        const y = centerY + wave1 + wave2 + wave3;
        points.push({ x, y });
      }
      
      // Create smooth path using cubic Bezier curves
      let path = `M ${points[0].x} ${points[0].y}`;
      
      for (let i = 1; i < points.length; i++) {
        const current = points[i];
        const previous = points[i - 1];
        
        if (i === 1) {
          // First curve - use simple control points
          const cp1x = previous.x + (current.x - previous.x) * 0.3;
          const cp1y = previous.y;
          const cp2x = previous.x + (current.x - previous.x) * 0.7;
          const cp2y = current.y;
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
        } else {
          // Calculate smooth control points based on neighboring points
          const prev2 = points[i - 2];
          const next = points[i + 1] || current;
          
          // Control point 1 (from previous point)
          const cp1x = previous.x + (current.x - prev2.x) * 0.15;
          const cp1y = previous.y + (current.y - prev2.y) * 0.15;
          
          // Control point 2 (to current point) 
          const cp2x = current.x - (next.x - previous.x) * 0.15;
          const cp2y = current.y - (next.y - previous.y) * 0.15;
          
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
        }
      }
      
      pathRef.current!.setAttribute('d', path);
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [speed, amplitude, frequency]);
  
  return (
    <div className={`absolute inset-0 ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="20%" stopColor={color} stopOpacity={opacity * 0.9} />
            <stop offset="50%" stopColor={color} stopOpacity={opacity} />
            <stop offset="80%" stopColor={color} stopOpacity={opacity * 0.7} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d="M 0 300 L 1200 300"
          stroke={`url(#gradient-${color.replace('#', '')})`}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// Hero Component
interface HeroProps {}

const Hero: React.FC<HeroProps> = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // TEMPORARILY HIDDEN - No active tournaments
  const isRegistrationActive = false;

  // Transform values for different elements
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleContact = () => {
    navigate('/contact');
  };

  const handleCreatePlayer = () => {
    navigate('/register');
  };

  // Soundwave configurations for layered effect
  const soundwaves = [
    { color: '#C42A2D', opacity: 0.8, speed: 0.008, amplitude: 60, frequency: 1, yOffset: 0 },
    { color: '#9D2224', opacity: 0.6, speed: 0.012, amplitude: 40, frequency: 3, yOffset: 80 },
    { color: '#7A1B1D', opacity: 0.4, speed: 0.006, amplitude: 80, frequency: 2, yOffset: -60 },
    { color: '#B8292C', opacity: 0.5, speed: 0.010, amplitude: 35, frequency: 5, yOffset: 120 },
    { color: '#6B1819', opacity: 0.3, speed: 0.014, amplitude: 25, frequency: 4, yOffset: -100 }
  ];

  return (
    <div ref={ref} className="hero-section">
      {/* Animated Soundwave Background */}
      <div className="soundwave-container">
        {/* Multiple soundwave layers */}
        {soundwaves.map((wave, index) => (
          <div
            key={index}
            className="absolute inset-0"
            style={{ 
              zIndex: index + 1,
              transform: `translateY(${wave.yOffset}px)`
            }}
          >
            <AnimatedSoundwave
              color={wave.color}
              opacity={wave.opacity}
              speed={wave.speed}
              amplitude={wave.amplitude}
              frequency={wave.frequency}
            />
          </div>
        ))}
        
        {/* Background gradient for depth */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 pointer-events-none" 
          style={{ zIndex: 0 }}
        />
        
        {/* Subtle overlay for text readability */}
        <div 
          className="absolute inset-0 bg-white/10 pointer-events-none" 
          style={{ zIndex: 15 }}
        />
      </div>
      
      {/* Hero Content */}
      <motion.div 
        className="hero-content"
        style={{ opacity, scale }}
      >
        <motion.div style={{ y: titleY }} className="hero-text-container">
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Moroccan Court Kings
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The first ever 1v1 basketball tournament in the African diaspora. 
            Join the movement and showcase your skills on the court.
          </motion.p>
          
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button 
              className="hero-btn hero-btn-primary" 
              onClick={handleLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
            <motion.button 
              className="hero-btn hero-btn-secondary" 
              onClick={handleContact}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.button>
            {isRegistrationActive && (
              <motion.button 
                className="hero-btn hero-btn-outline" 
                onClick={handleCreatePlayer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create a Player
              </motion.button>
            )}
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="scroll-arrow"
          >
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
          <span className="scroll-text">Scroll to explore</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
