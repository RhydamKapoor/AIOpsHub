import { createContext, useEffect, useState } from 'react';
import { usePrefersTheme } from 'react-haiku';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = usePrefersTheme();
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || systemTheme;
  });

  // Update theme when system preference changes and no user preference is set
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      setTheme(systemTheme);
    }
  }, [systemTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
