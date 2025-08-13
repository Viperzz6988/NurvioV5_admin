import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

export type ThemeMode = 'light' | 'dark';

type ThemeCtx = { mode: ThemeMode; toggle: () => void };
const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export const ThemeProviderCustom: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem('theme') as ThemeMode) || 'light');

  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggle = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProviderCustom');
  return ctx;
};