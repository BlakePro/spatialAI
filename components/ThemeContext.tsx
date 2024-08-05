'use client';
import { createContext, useState, ReactNode, useContext } from 'react';
import { getThemeColor, to } from '@utilities/tools';
import { cookie } from '@utilities/cookie';

export type Theme = 'light' | 'dark';

const themeChange = (color: any): void => {
  let doc = window.document.documentElement;
  if (doc && color) {
    doc.classList.remove('light');
    doc.classList.remove('dark');
    doc.classList.add(color);
    const themeColor: string = getThemeColor(color);
    setMetaColorTheme(themeColor);
  }
};

export const setMetaColorTheme = (themeColor: any): void => {
  let themeSelector = document.querySelector('meta[name="theme-color"]');
  if (themeSelector) themeSelector.setAttribute('content', themeColor);

  let titleSelector = document.querySelector('meta[name="msapplication-TileColor"]');
  if (titleSelector) titleSelector.setAttribute('content', themeColor);

  let appleBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleBar) appleBar.setAttribute('content', themeColor);
};

export type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const initialThemeContext: ThemeContextType = {
  theme: 'light',
  toggleTheme: () => 'light',
};

const ThemeContext = createContext<ThemeContextType>(initialThemeContext);

export const ThemeProvider = ({ defaultTheme, children }: { defaultTheme: string; children: ReactNode }): ReactNode => {
  const [theme, setTheme] = useState<any>(defaultTheme);

  const toggleTheme = () => {
    const color: Theme = theme === 'light' ? 'dark' : 'light'
    cookie.set('theme', color);
    setTheme(color);
    themeChange(color);
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => useContext(ThemeContext);
