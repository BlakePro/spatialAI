import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from "react";

export const Modal = ({ icon, isOpen, children }: { icon: ReactNode, isOpen: boolean; children: ReactNode }) => {
  return (
    <AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`${isOpen ? '' : 'hidden'} bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer`}
      >
        <motion.div
          initial={{ scale: 0, rotate: "12.5deg" }}
          animate={{ scale: 1, rotate: "0deg" }}
          exit={{ scale: 0, rotate: "0deg" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
        >
          <div>
            {icon}
          </div>
          <div className="w-full flex flex-col gap-6">
            {children}
          </div>
        </motion.div>
      </motion.div>

    </AnimatePresence >
  );
};
