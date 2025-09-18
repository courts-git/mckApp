import React, { useEffect, useState } from 'react';
import './ChromaGrid.css';

interface ChromaGridProps {
  rows?: number;
  cols?: number;
  className?: string;
}

const ChromaGrid: React.FC<ChromaGridProps> = ({ 
  rows = 8, 
  cols = 12, 
  className = '' 
}) => {
  const [animatedCells, setAnimatedCells] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const totalCells = rows * cols;
      const newAnimatedCells = new Set<number>();
      
      // Randomly select 3-5 cells to animate
      const numCellsToAnimate = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < numCellsToAnimate; i++) {
        const randomCell = Math.floor(Math.random() * totalCells);
        newAnimatedCells.add(randomCell);
      }
      
      setAnimatedCells(newAnimatedCells);
    }, 2000);

    return () => clearInterval(interval);
  }, [rows, cols]);

  const generateGrid = () => {
    const grid = [];
    for (let i = 0; i < rows * cols; i++) {
      const isAnimated = animatedCells.has(i);
      grid.push(
        <div
          key={i}
          className={`chroma-cell ${isAnimated ? 'chroma-cell--active' : ''}`}
          style={{
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      );
    }
    return grid;
  };

  return (
    <div 
      className={`chroma-grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
    >
      {generateGrid()}
    </div>
  );
};

export default ChromaGrid;
