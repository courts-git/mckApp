import React, { useState, useEffect } from 'react';
import './CountdownTimer.css';

interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  subtitle?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  title = "Something Amazing is Coming",
  subtitle = "Get ready for an extraordinary basketball experience"
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        // Target date reached - set completion state and trigger auto refresh
        setIsComplete(true);
        
        setTimeout(() => {
          window.location.reload();
        }, 2000); // 2 second delay for smooth transition animation
        
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Double-check for refresh trigger in case the component doesn't re-render
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsComplete(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={`countdown-overlay ${isComplete ? 'countdown-complete' : ''}`}>
      {/* Main Content */}
      <div className="countdown-content">
        {/* Moroccan Decorative Element */}
        <div className="moroccan-ornament">
          <svg viewBox="0 0 100 100" className="ornament-svg">
            <path
              d="M50 10 L60 25 L75 25 L65 40 L70 55 L50 45 L30 55 L35 40 L25 25 L40 25 Z"
              fill="currentColor"
              opacity="0.3"
            />
            <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>

        {/* Title Section */}
        <div className="countdown-header">
          <h1 className="countdown-title">{title}</h1>
          <p className="countdown-subtitle">{subtitle}</p>
        </div>

        {/* Timer Display */}
        <div className="timer-grid">
          <div className="time-unit">
            <div className="time-card">
              <span className="time-number">{timeLeft.days}</span>
              <div className="time-divider"></div>
            </div>
            <span className="time-label">Days</span>
          </div>

          <div className="time-separator">:</div>

          <div className="time-unit">
            <div className="time-card">
              <span className="time-number">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <div className="time-divider"></div>
            </div>
            <span className="time-label">Hours</span>
          </div>

          <div className="time-separator">:</div>

          <div className="time-unit">
            <div className="time-card">
              <span className="time-number">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <div className="time-divider"></div>
            </div>
            <span className="time-label">Minutes</span>
          </div>

          <div className="time-separator">:</div>

          <div className="time-unit">
            <div className="time-card">
              <span className="time-number">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <div className="time-divider"></div>
            </div>
            <span className="time-label">Seconds</span>
          </div>
        </div>

        {/* Bottom Decorative Elements */}
        <div className="bottom-ornaments">
          <div className="ornament-line">
            <div className="ornament-dot"></div>
            <div className="ornament-dash"></div>
            <div className="ornament-dot"></div>
            <div className="ornament-dash"></div>
            <div className="ornament-dot"></div>
          </div>
        </div>

        {/* Brand Element */}
        <div className="brand-element">
          <div className="brand-text">Moroccan Court Kings</div>
        </div>

        {/* Launch Message when countdown completes */}
        {isComplete && (
          <div className="launch-message">
            <h2>🚀 Launching Now!</h2>
            <p>Redirecting to your basketball experience...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
