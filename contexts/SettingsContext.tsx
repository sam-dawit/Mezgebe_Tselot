import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'english' | 'amharic';
type FontSize = 'small' | 'medium' | 'large';

interface SettingsContextType {
  language: Language;
  fontSize: FontSize;
  setLanguage: (lang: Language) => void;
  setFontSize: (size: FontSize) => void;
  getFontSize: () => number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('english');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      const savedFontSize = await AsyncStorage.getItem('fontSize');
      
      if (savedLanguage) setLanguageState(savedLanguage as Language);
      if (savedFontSize) setFontSizeState(savedFontSize as FontSize);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('language', lang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  const setFontSize = async (size: FontSize) => {
    setFontSizeState(size);
    try {
      await AsyncStorage.setItem('fontSize', size);
    } catch (e) {
      console.error('Failed to save font size', e);
    }
  };

  const getFontSize = () => {
    switch (fontSize) {
      case 'small': return 16;
      case 'large': return 22;
      default: return 18;
    }
  };

  return (
    <SettingsContext.Provider value={{ language, fontSize, setLanguage, setFontSize, getFontSize }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
