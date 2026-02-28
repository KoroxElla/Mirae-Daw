

import React from "react";
import { motion } from "framer-motion";

interface Props {
  textLength: number;
}

const AnimatedPen: React.FC<Props> = ({ textLength }) => {
  return (
    <motion.img
      src="/journal/pen.png"
      alt="Writing Pen"
      className="absolute w-20 pointer-events-none"
      animate={{
        x: (textLength % 40) * 5,
        y: Math.floor(textLength / 40) * 20
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15
      }}
      style={{
        bottom: 30,
        right: 50
      }}
    />
  );
};

export default AnimatedPen;
