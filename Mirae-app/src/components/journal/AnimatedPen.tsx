import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface Props {
  position: { x: number; y: number };
  isErasing: boolean;
  pageWidth: number;
  lineHeight: number;
}

const AnimatedPen: React.FC<Props> = ({ position, isErasing, pageWidth, lineHeight }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      x: position.x,
      y: position.y,
      transition: { type: 'spring', stiffness: 500, damping: 30 }
    });
  }, [position, controls]);

  return (
    <motion.div
      className="absolute pointer-events-none z-[100]"
      animate={controls}
      initial={{ x: 0, y: 0 }}
      style={{
        top: 0,
        left: 0,
      }}
    >
      <div 
        style={{
          transform: `translateY(${isErasing ? -1 : -45}px) rotate(${isErasing ? 180 : -12}deg)`,
          transformOrigin: isErasing ? 'top left' : 'bottom left',
          transition: 'transform 0.3s ease',
          width: '2rem',
          height: 'auto',
        }}
      >
        <img 
          src="/journal/pen.png" 
          alt="Pen" 
          className="w-19 h-12"
        />
      </div>
    </motion.div>
  );
};

export default AnimatedPen;
