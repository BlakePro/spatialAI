import { Variants, motion } from 'framer-motion';
import { ReactNode } from "react";

const variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 1,
      ease: "easeIn",
    },
  },
} as Variants;

export const DotLoader = (): ReactNode => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="flex items-center gap-2 h-5"
    >
      <motion.div variants={variants} className="size-2.5 rounded-full bg-white" />
      <motion.div variants={variants} className="size-2.5 rounded-full bg-white" />
      <motion.div variants={variants} className="size-2.5 rounded-full bg-white" />
    </motion.div>
  );
};
