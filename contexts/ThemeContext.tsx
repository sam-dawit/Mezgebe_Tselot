import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  border: string;
  shadow: string;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  border: '#E5E7EB',
  shadow: '#00000010',
};

const darkColors: ThemeColors = {
  background: '#111827',
  surface: '#1F2937',
  card: '#374151',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  border: '#374151',
  shadow: '#00000040',
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
  autoTheme: boolean;
  setAutoTheme: (auto: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getTimeBasedTheme = (): Theme => {
  const hour = new Date().getHours();
  // Dark between 7pm-7am, light otherwise
  return hour >= 19 || hour < 7 ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');
  const [autoTheme, setAutoThemeState] = useState<boolean>(false);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (autoTheme) {
      const applyTimeTheme = () => {
        setTheme(getTimeBasedTheme());
      };
      applyTimeTheme();
      interval = setInterval(applyTimeTheme, 15 * 60 * 1000); // refresh every 15 minutes
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoTheme]);

  const loadTheme = async () => {
    try {
      const [savedTheme, savedAuto] = await Promise.all([
        AsyncStorage.getItem('theme'),
        AsyncStorage.getItem('autoTheme'),
      ]);

      if (savedAuto === 'true') {
        setAutoThemeState(true);
        setTheme(getTimeBasedTheme());
      } else if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
    } catch (e) {
      console.error('Failed to load theme', e);
    }
  };

  const setAutoTheme = async (auto: boolean) => {
    setAutoThemeState(auto);
    try {
      await AsyncStorage.setItem('autoTheme', auto ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to save autoTheme', e);
    }
    if (auto) {
      setTheme(getTimeBasedTheme());
    }
  };

  const toggleTheme = async () => {
    // Manual toggle disables auto mode
    if (autoTheme) {
      await setAutoTheme(false);
    }
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, autoTheme, setAutoTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
