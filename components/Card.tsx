'use client';
import { motion, useDragControls } from 'framer-motion';
import { ReactNode } from 'react';

interface ICard {
  text: string;
  backgroundColor: string
  position: { x: number; y: number };
  constraintsRef: any;
  children: ReactNode;
}

export const Card = ({ text, position, backgroundColor, constraintsRef, children }: ICard): ReactNode => {
  const controls = useDragControls()

  return (
    <motion.div
      dragConstraints={constraintsRef}
      className="drag-element absolute w-full h-full max-w-72 rounded-lg"
      drag
      dragElastic={1}
      dragControls={controls}
      style={position}
    >
      <div className="z-10 absolute -top-4 -left-4 bg-slate-100/30 text-sm p-1 rounded-full text-white">
        {text}
      </div>
      <div className={`absolute py-2 px-3 text-white rounded-lg flex items-center ${backgroundColor}`}>
        {children}
      </div>
    </motion.div>
  );
};