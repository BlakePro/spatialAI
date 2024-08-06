'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Sun, MoonStars } from '@phosphor-icons/react/dist/ssr';
import { useThemeContext } from '@components/ThemeContext';

const TOGGLE_CLASSES = 'flex items-center gap-1 px-2 py-1.5 transition-colors relative z-10 hover:opacity-80';

export const ButtonTheme = (): ReactNode => {
  const { theme, toggleTheme } = useThemeContext();
  return (
    <div className="relative flex w-fit items-center rounded-full bg-white dark:bg-slate-900">
      <button type="button" className={`${TOGGLE_CLASSES} ${theme == 'light' ? ' text-white' : 'text-white'}`} onClick={toggleTheme} >
        <Sun className="relative z-10 text-2xl" />
      </button>
      <button type="button" className={`${TOGGLE_CLASSES} ${theme == 'light' ? ' text-black' : 'text-white'}`} onClick={toggleTheme} >
        <MoonStars className="relative z-10 text-2xl" />
      </button>
      <div className={`absolute inset-0 z-0 flex ${theme === "dark" ? "justify-end" : "justify-start"}`}>
        <motion.span
          layout
          transition={{ type: "spring", damping: 15, stiffness: 250 }}
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
        />
      </div>
    </div>
  );
};