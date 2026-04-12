/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from 'react';

interface ThemeContextValue {
  theme: 'corporate';
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'corporate' });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeContext.Provider value={{ theme: 'corporate' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
