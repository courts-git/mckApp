import React, { useState } from 'react';
import './DomeGallery.css';

interface DomeGalleryProps {
  images?: string[];
}

const DomeGallery: React.FC<DomeGalleryProps> = ({ 
  images = Array(10).fill('/heroBackground.jpg') // Default to 10 instances of heroBackground.jpg
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="circular-gallery-section">
      <div className="circular-container">
        <div className="circular-gallery">
          <div className="circular-track">
            {images.map((imageSrc, index) => {
              const angle = (index * 36) - 90; // 360/10 = 36 degrees per image, start from top
              
              return (
                <div
                  key={index}
                  className="circular-item"
                  style={{
                    '--angle': angle,
                    '--index': index,
                  } as React.CSSProperties}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="image-container">
                    <img 
                      src={imageSrc} 
                      alt={`Gallery image ${index + 1}`}
                      className="circular-image"
                      loading="lazy"
                    />
                    <div className={`image-overlay ${hoveredIndex === index ? 'visible' : ''}`}>
                      <span className="image-number">{index + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Center decoration */}
          <div className="center-decoration">
            <div className="center-logo">
              <img src="/mckLogo.png" alt="MCK" className="center-logo-img" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DomeGallery;
