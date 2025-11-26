import axios from 'axios';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
// Use LAN IP for device access
// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
// Use LAN IP for device access
const BASE_URL = 'http://127.0.0.1:8000/api';

export interface Book {
  _id: string;
  name_english: string;
  name_amharic: string;
  chapters: number;
  category: string;
  testament?: string;
}

export interface Verse {
  _id: string;
  book: string;
  chapter: number;
  verse: number;
  text_english: string;
  text_amharic: string;
}

export interface Commentary {
  _id: string;
  verse_id: string;
  text_english: string;
  text_amharic: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  phone_number?: string;
  two_factor_method?: 'none' | 'sms' | 'email';
}

export interface Church {
  _id: string;
  name: string;
  description?: string;
  state: string;
  address?: string;
  website?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export const api = {
  // Books & Verses
  getBooks: async (): Promise<Book[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/books`);
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
    }
  },

  getChapterVerses: async (book: string, chapter: number): Promise<Verse[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/books/${book}/chapters/${chapter}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching verses:', error);
      return [];
    }
  },

  getCommentary: async (verseId: string): Promise<Commentary | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/commentary/${verseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching commentary:', error);
      return null;
    }
  },

  searchVerses: async (query: string, language: 'english' | 'amharic'): Promise<Verse[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: { q: query, language }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
  },

  getVersion: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/version`);
      return response.data;
    } catch (error) {
      console.error('Error fetching version:', error);
      return null;
    }
  },
  
  initData: async () => {
      try {
          const response = await axios.post(`${BASE_URL}/init-data`);
          return response.data;
      } catch (error) {
          console.error('Error initializing data:', error);
          return null;
      }
  },

  // Auth
  login: async (username: string, password: string): Promise<{
    access_token: string;
    two_factor_required?: boolean;
    temp_token?: string;
  } | null> => {
    try {
      console.log('API Login called for:', username);
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      console.log('Sending request to:', `${BASE_URL}/auth/login`);
      const response = await axios.post(`${BASE_URL}/auth/login`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('API Login success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error in API:', error);
      throw error;
    }
  },

  verify2FA: async (temp_token: string, code: string): Promise<{access_token: string} | null> => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/verify-2fa`, {
        temp_token,
        code
      });
      return response.data;
    } catch (error) {
      console.error('2FA Verification error:', error);
      throw error;
    }
  },

  register: async (username: string, email: string, password: string, phone_number?: string, two_factor_method: string = 'none'): Promise<{access_token: string} | null> => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        username, email, password, phone_number, two_factor_method
      });
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  getMe: async (): Promise<User | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/me`);
      return response.data;
    } catch (error) {
      console.error('Get Me error:', error);
      return null;
    }
  },

  // Churches
  getChurches: async (state?: string): Promise<Church[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/churches`, {
        params: { state }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching churches:', error);
      return [];
    }
  },

  getNearbyChurches: async (lat: number, long: number): Promise<Church[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/churches/nearby`, {
        params: { lat, long }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby churches:', error);
      return [];
    }
  }
};
